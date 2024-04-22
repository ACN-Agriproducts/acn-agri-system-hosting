import { Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { doc, Firestore, getDoc, getDocs, QuerySnapshot, where } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { TranslocoService } from '@ngneat/transloco';
import { Company } from '@shared/classes/company';
import { FirebaseDocInterface } from '@shared/classes/FirebaseDocInterface';
import { units } from '@shared/classes/mass';
import { Plant } from '@shared/classes/plant';
import { User } from '@shared/classes/user';

export interface UserInterface {
  email: string,
  uid: string, 
  refreshToken: string, 
  name: string,
  worksAt: string[],
  currentPermissions: any,
  defaultLanguage: langOpts
}

declare type keyOpts = 'currentCompany' | 'currentPlant' | 'user' | 'companyUnit' | 'userUnit' | 'companyDisplayUnit' | 'defaultLanguage';
export declare type langOpts = 'en' | 'es'; // update language options to 'en-US' and 'es-MX' maybe ???

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
  private language: langOpts;
  private companyObject$: Promise<Company>;

  private keyMap: Map<keyOpts, string>;

  constructor(
    private localStorage: Storage,
    private db: Firestore,
    private transloco: TranslocoService,
    private auth: Auth
  ) { 
    this.keyMap= new Map<keyOpts, string>();
    this.keyMap.set('currentCompany', 'company');
    this.keyMap.set('currentPlant', 'plant');
    this.keyMap.set('user', 'user');
    this.keyMap.set('companyUnit', 'companyUnit');
    this.keyMap.set('userUnit', 'userUnit');  // get from user doc
    this.keyMap.set('companyDisplayUnit', 'companyDisplayUnit');
    this.keyMap.set('defaultLanguage', 'defaultLanguage');  // get from user or company
  }

  public async load(): Promise<void> {
    const localPromises = [];
    const dbPromises: {
      plants?: Promise<QuerySnapshot>,
      company?: Promise<Company>,
      user?: Promise<User>
    } = {};
    FirebaseDocInterface.session = this;

    // Get all locally stored values
    localPromises.push(this.localStorage.get('currentCompany').then(val => {
      this.companyObject$ = Company.getCompany(this.db, val);
      this.companyObject$.then(c => c.getLogoURL(this.db));
      return this.company = val;
    }));
    
    localPromises.push(this.localStorage.get('currentPlant').then(val => {
      return this.plant = val;
    }));

    localPromises.push(this.localStorage.get('user').then(async val => {
      this.user = val;
    }));

    localPromises.push(this.localStorage.get('companyUnit').then(async val => {
      this.companyUnit = val;
    }));

    localPromises.push(this.localStorage.get('userUnit').then(async val => {
      this.userUnit = val;
    }));

    localPromises.push(this.localStorage.get('companyDisplayUnit').then(async val => {
      this.companyDisplayUnit = val;
    }));

    localPromises.push(this.localStorage.get('defaultLanguage').then(async val => {
      this.language = val;
    }));

    // Get missing values from db if logged in
    const unsubAuth = this.auth.onAuthStateChanged(user => {
      if(!user) return;

      if(this.getPermissions()?.isScale) this.plant = this.getPermissions()?.scalePlant;

      else dbPromises.plants = getDocs(Plant.getCollectionReference(this.db, this.company).withConverter(null)).then(plants => {
        if(plants.docs.some(p => p.ref.id == this.plant)) return plants;
        this.plant = plants[0].ref.id;
  
        return plants;
      });
  
      //dbPromises.user = User.getUser(this.db, this.user.uid); // Add user unit
  
      if(!this.companyUnit || !this.companyDisplayUnit) {
        dbPromises.company = Company.getCompany(this.db, this.company).then(company => {
          this.set("companyUnit", company.defaultUnit);
          this.set("companyDisplayUnit", company.displayUnit);
  
          return company;
        });
      }

      if(!this.language) {
        (dbPromises.user ?? User.getUser(this.db, this.user.uid)).then(async user => {
          this.language = user.language 
            || (await (dbPromises.company ?? Company.getCompany(this.db, this.company)))?.defaultLanguage
            || 'es';
  
        });
      }
      else {
        this.transloco.setActiveLang(this.language);
      }
    });

    

    return Promise.all(localPromises).then(() => {});
  }

  public async loadNewCompany(companyName: string): Promise<any> {
    this.set('currentCompany', companyName);
    const promises = [];

    promises.push(Company.getCompany(this.db, companyName).then(companyDoc => {
      this.set('companyDisplayUnit', companyDoc.displayUnit);
      this.set('companyUnit', companyDoc.defaultUnit);
    }));

    promises.push(getDoc(doc(User.getDocumentReference(this.db, this.user.uid), 'companies', companyName)).then(async permissionsDoc => {
      this.user.currentPermissions = permissionsDoc.get('permissions');
      await this.set('user', this.user);

      if(this.user.currentPermissions?.admin || this.user.currentPermissions?.tickets?.read || this.user.currentPermissions?.inventory?.read){
        const plants = await getDocs(Plant.getCollectionReference(this.db, companyName).withConverter(null));
        await this.set('currentPlant', plants.docs[0]?.ref.id ?? "");
      }
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
    if(this.user?.currentPermissions?.isScale) return this.user?.currentPermissions?.scalePlant;
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

  public getLanguage(): string {
    return this.language;
  }

  public getCompanyObject(): Promise<Company> {
    return this.companyObject$;
  }

  public clear(): Promise<void> {
    this.company = null;
    this.plant = null;
    this.user = null;

    return this.localStorage.clear();
  }
}
