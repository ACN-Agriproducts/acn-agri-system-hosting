import { Injectable } from '@angular/core';
import { where } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';

interface User {
  email: string,
  uid: string, 
  refreshToken: string, 
  name: string,
  worksAt: string[],
  currentPermissions: any
}

declare type keyOpts = 'currentCompany' | 'currentPlant' | 'user'

@Injectable({
  providedIn: 'root'
})
export class SessionInfo {
  private company: string;
  private plant: string;
  private user: User;

  private keyMap: Map<keyOpts, string>;

  constructor(
    private localStorage: Storage
  ) { 
    this.keyMap= new Map<keyOpts, string>();
    this.keyMap.set('currentCompany', 'company');
    this.keyMap.set('currentPlant', 'plant');
    this.keyMap.set('user', 'user');
  }

  public load(): Promise<void> {
    const promises = [];

    promises.push(this.localStorage.get('currentCompany').then(val => {
      this.company = val;
    }));

    promises.push(this.localStorage.get('currentPlant').then(val => {
      this.plant = val;
    }));

    promises.push(this.localStorage.get('user').then(val => {
      this.user = val;
    }));

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

  public clear(): Promise<void> {
    this.company = null;
    this.plant = null;
    this.user = null;

    return this.localStorage.clear();
  }
}
