import { Injectable } from '@angular/core';
import { CollectionReference, Firestore, query, where } from '@angular/fire/firestore';
import { CompanyService } from '@core/services/company/company.service';
import { Contract } from '@shared/classes/contract';
import { collection } from 'firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  activeContracts: Observable<Contract[]>;

  constructor(
    private company: CompanyService,
    private db: Firestore
  ) { }

  getActive(): Observable<Contract[]> {
    return this.activeContracts ??= collectionData(query(this.getCollectionReference(), where('status', '==', 'active')));
  }

  getActiveGrouped(): Observable<{[type: string]: Contract[]}> {
    return this.getActive().pipe(
      map(list => {
        const groupedContracts:{[type: string]: Contract[]}  = {};
        list.sort((a,b) => a.id - b.id);

        for(let contract of list) {
          groupedContracts[contract.type] ??= [];
          groupedContracts[contract.type].push(contract);
        }

        return groupedContracts
      })
    );
  }

  getCollectionReference(): CollectionReference<Contract> {
    return collection(this.company.getCompanyReference(), 'contracts').withConverter(Contract.converter);
  }
}
