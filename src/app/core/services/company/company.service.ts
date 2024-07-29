import { Injectable } from '@angular/core';
import { collection, CollectionReference, doc, DocumentReference, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Company, CompanyContact } from '@shared/classes/company';
import { Plant } from '@shared/classes/plant';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private company: Company;
  private plantsList: Plant[];
  private currentPlant: Plant;
  private transportList: CompanyContact[];

  constructor(
    private db: Firestore,
    private storage: Storage
  ) {}

  async initialize(): Promise<any> {
    const companyName = await this.storage.get('currentCompany') as string;
    if (!companyName) return;
    const plantsCollectionRef = collection(this.getCompanyReference(companyName), 'plants').withConverter(Plant.converter);

    return Promise.all([
      getDoc(this.getCompanyReference(companyName)).then(val => this.company = val.data()),
      getDocs(plantsCollectionRef).then(list => this.plantsList = list.docs.map(p => p.data()))
    ]);
  }

  public getCollectionReference(): CollectionReference<Company> {
    return collection(this.db, 'companies').withConverter(Company.converter);
  }

  public getCompanyReference(name: string = this.company.ref.id): DocumentReference<Company> {
    return doc(this.getCollectionReference(), name);
  }

  public getCompany(): Company {
    return this.company;
  }

  public getPlantsList(): Plant[] {
    return this.plantsList;
  }

  public getCurrentPlant(): Plant {
    return this.currentPlant;
  }

  public getContactsList(): CompanyContact[] {
    return this.company.contactList;
  }

  public getPlantsNamesList(): string[] {
    return this.plantsList.map(p => p.ref.id);
  }

  public getTransportList(): CompanyContact[] {
    return this.transportList ??= this.company.contactList.filter(c => c.tags.includes('trucker'));
  }
}
