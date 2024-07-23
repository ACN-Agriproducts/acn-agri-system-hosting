import { Injectable } from '@angular/core';
import { CollectionReference, Firestore, query, where } from '@angular/fire/firestore';
import { CompanyService } from '@core/services/company/company.service';
import { Contract } from '@shared/classes/contract';
import { collection } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  activeContracts: Observable<Contract[]>
  cache: Map<string, Contract>;

  constructor(
    private company: CompanyService,
    private db: Firestore
  ) {
    this.cache = new Map<string, Contract>();
  }

  getActive(): Observable<Contract[]> {
    return this.activeContracts ??= collectionData(query(this.getCollectionReference(), where('status', '==', 'active')));
  }

  getCollectionReference(): CollectionReference<Contract> {
    return collection(this.company.getCompanyReference(), 'contracts').withConverter(Contract.converter);
  }
}
