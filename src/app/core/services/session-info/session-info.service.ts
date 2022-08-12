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
export class SessionInfoService {
  private company: string;
  private plant: string;
  private user: User;

  constructor(
    private localStorage: Storage
  ) { }

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
    return this.localStorage.set(key, data);
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
}
