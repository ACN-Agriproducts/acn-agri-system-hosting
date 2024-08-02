import { Injectable } from '@angular/core';
import { collection, CollectionReference, Firestore, getDocs, limit, orderBy, query } from '@angular/fire/firestore';
import { CompanyService } from '../company/company.service';
import { DashboardData } from '@shared/classes/dashboard-data';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private db: Firestore,
    private company: CompanyService
  ) {}

  public getCollectionReference(): CollectionReference<DashboardData> {
    return collection(this.company.getCompanyReference(), "dashboard-data").withConverter(DashboardData.converter);
  }

  public async getDashboardData(): Promise<DashboardData> {
    console.log("Company: ", this.company.getCompany())
    const colQuery = query(this.getCollectionReference(), orderBy('date', 'desc'), limit(1));
    return getDocs(colQuery).then(result => result.docs[0].data());
  }
}
