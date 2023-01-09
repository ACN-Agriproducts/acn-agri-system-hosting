import { Injectable } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Company } from '@shared/classes/company';
import { FirebaseDocInterface } from '@shared/classes/FirebaseDocInterface';
import { units } from '@shared/classes/mass';

interface User {
  email: string,
  uid: string, 
  refreshToken: string, 
  name: string,
  worksAt: string[],
  currentPermissions: any
}

declare type keyOpts = 'currentCompany' | 'currentPlant' | 'user' | 'companyUnit' | 'userUnit'

@Injectable({
  providedIn: 'root'
})
export class SessionInfo {
  private company: string;
  private plant: string;
  private user: User;
  private companyUnit: units;
  private userUnit: units;

  private keyMap: Map<keyOpts, string>;

  constructor(
    private localStorage: Storage,
    private db: Firestore
  ) { 
    this.keyMap= new Map<keyOpts, string>();
    this.keyMap.set('currentCompany', 'company');
    this.keyMap.set('currentPlant', 'plant');
    this.keyMap.set('user', 'user');
    this.keyMap.set('companyUnit', 'companyUnit');
    this.keyMap.set('userUnit', 'userUnit');
  }

  public load(): Promise<void> {
    const promises = [];

    promises.push(this.localStorage.get('currentCompany').then(val => {
      return this.company = val;
      
    }).then(async company => {
      if(!company) return; 
      let unit = await this.localStorage.get('companyUnit');
      if(!unit) {
        unit = (await Company.getCompany(this.db, company)).defaultUnit;
        this.localStorage.set('userUnit', unit);
      }

      this.companyUnit = unit;
    }));

    promises.push(this.localStorage.get('currentPlant').then(val => {
      this.plant = val;
    }));

    promises.push(this.localStorage.get('user').then(val => {
      this.user = val;
    }));

    promises.push(this.localStorage.get('user').then(val => {
      this.userUnit = val;
    }));

    FirebaseDocInterface.session = this;
    return Promise.all(promises).then(() => {});
  }

  public set(key: keyOpts, data: any): Promise<void> {
    const objectKey: string = this.keyMap.get(key);
    if(objectKey == null) {
      console.log("Key not set", key);
      return;
    }

    this.localStorage.set(key, data);
    this[objectKey] = data;
  }

  public getCompany(): string {
    return this.company;
  }

  public getPlant(): string {
    return this.plant;
  }

  public getUser(): User {
    return this.user;
  }

  public getPermissions(): any {
    return this.user?.currentPermissions;
  }

  public getDefaultUnit(): units {
    return this.companyUnit;
  }

  public getUserUnits(): units {
    return this.userUnit;
  }

  public clear(): Promise<void> {
    this.company = null;
    this.plant = null;
    this.user = null;

    return this.localStorage.clear();
  }
}
