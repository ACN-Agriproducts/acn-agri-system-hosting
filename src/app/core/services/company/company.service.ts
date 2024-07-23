import { Injectable } from '@angular/core';
import { collection, CollectionReference, doc, DocumentReference, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Company } from '@shared/classes/company';
import { Plant } from '@shared/classes/plant';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  company: Company;
  plantsList: Plant[];
  currentPlant: Plant;

  constructor(
    private db: Firestore,
    private storage: Storage
  ) {}

  async initialize(): Promise<any> {
    const companyName = await this.storage.get('currentCompany') as string;
    const plantsCollectionRef = collection(this.getCompanyReference(companyName), 'plants').withConverter(Plant.converter);
    console.log(plantsCollectionRef.path);

    return Promise.all([
      getDoc(this.getCompanyReference(companyName)).then(val => this.company = val.data()),
      getDocs(plantsCollectionRef).then(list => this.plantsList = list.docs.map(p => p.data()))
    ]);
  }

  public getCollectionReference(): CollectionReference<Company> {
    return collection(this.db, 'companies').withConverter(Company.converter);
  }

  public getCompanyReference(name: string): DocumentReference<Company> {
    return doc(this.getCollectionReference(), name);
  }
}
