import { Injectable } from '@angular/core';
import { doc, Firestore, getDoc, where } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { TranslocoService } from '@ngneat/transloco';
import { Company } from '@shared/classes/company';
import { FirebaseDocInterface } from '@shared/classes/FirebaseDocInterface';
import { units } from '@shared/classes/mass';
import { User } from '@shared/classes/user';

interface UserInterface {
  email: string,
  uid: string, 
  refreshToken: string, 
  name: string,
  worksAt: string[],
  currentPermissions: any
}

declare type keyOpts = 'currentCompany' | 'currentPlant' | 'user' | 'companyUnit' | 'userUnit' | 'companyDisplayUnit' | 'defaultLanguage';

@Injectable({
  providedIn: 'root'
})
export class SessionInfo {
  private company: string;
  private plant: string;
  private user: UserInterface;
  private companyUnit: units;
  private companyDisplayUnit: units;
  private userUnit: units;
  private defaultLanguage: 'en' | 'es';

  private keyMap: Map<keyOpts, string>;

  constructor(
    private localStorage: Storage,
    private db: Firestore,
    private transloco: TranslocoService,
  ) { 
    this.keyMap= new Map<keyOpts, string>();
    this.keyMap.set('currentCompany', 'company');
    this.keyMap.set('currentPlant', 'plant');
    this.keyMap.set('user', 'user');
    this.keyMap.set('companyUnit', 'companyUnit');
    this.keyMap.set('userUnit', 'userUnit');
    this.keyMap.set('companyDisplayUnit', 'companyDisplayUnit');
    this.keyMap.set('defaultLanguage', 'defaultLanguage');
  }

  public load(): Promise<void> {
    const promises = [];

    promises.push(this.localStorage.get('currentCompany').then(val => {
      return this.company = val;
      
    }).then(async company => {
      if(!company) return;
      let unit = await this.localStorage.get('companyUnit');
      let companyDoc: Company;
      if(!unit) {
        companyDoc = await Company.getCompany(this.db, company);
        unit = companyDoc.defaultUnit;
        this.localStorage.set('userUnit', companyDoc.defaultUnit);
      }

      let companyDisplayUnit = await this.localStorage.get('companyDisplayUnit');
      if(!companyDisplayUnit) {
        companyDoc ??= await Company.getCompany(this.db, company);
        companyDisplayUnit = companyDoc.displayUnit;
        this.localStorage.set('companyDisplayUnit', companyDoc.displayUnit);
      }

      this.companyUnit = unit;
      this.companyDisplayUnit = companyDisplayUnit;
    }).catch(error => {
      console.error(error);
    }));

    promises.push(this.localStorage.get('currentPlant').then(val => {
      this.plant = val;
    }));

    promises.push(this.localStorage.get('user').then(val => {
      this.user = val;
    }));

    promises.push(this.localStorage.get('userUnit').then(val => {
      this.userUnit = val;
    }));

    promises.push(this.localStorage.get('defaultLanguage').then(val => {
      this.defaultLanguage = val || 'es';
      this.transloco.setActiveLang(this.defaultLanguage);
    }));

    FirebaseDocInterface.session = this;
    return Promise.all(promises).then(() => {});
  }

  public loadNewCompany(companyName: string): Promise<any> {
    this.set('currentCompany', companyName);
    const promises = [];

    promises.push(Company.getCompany(this.db, companyName).then(companyDoc => {
      companyDoc.getPlants().then(plants => {
        this.set('currentPlant', plants[0]);
      });

      this.set('companyDisplayUnit', companyDoc.displayUnit);
      this.set('companyUnit', companyDoc.defaultUnit);
    }));

    promises.push(getDoc(doc(User.getDocumentReference(this.db, this.user.uid), 'companies', companyName)).then(permissionsDoc => {
      this.user.currentPermissions = permissionsDoc.get('permissions');
    }));

    return Promise.all(promises);
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

  public getUser(): UserInterface {
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

  public getDisplayUnit(): units {
    return this.companyDisplayUnit;
  }

  public clear(): Promise<void> {
    this.company = null;
    this.plant = null;
    this.user = null;

    return this.localStorage.clear();
  }
}
