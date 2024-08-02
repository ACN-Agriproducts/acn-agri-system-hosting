import { Injectable } from '@angular/core';
import { CollectionReference, Firestore, getDoc, getDocs, limit, query, where, QueryConstraint, collection, OrderByDirection, orderBy, doc, startAfter } from '@angular/fire/firestore';
import { CompanyService } from '@core/services/company/company.service';
import { CompanyContact } from '@shared/classes/company';
import { Contract, ContractStatus, contractType } from '@shared/classes/contract';
import { ContractSettings } from '@shared/classes/contract-settings';
import { Ticket } from '@shared/classes/ticket';
import { collectionData } from 'rxfire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  activeContracts: Observable<Contract[]>;
  contractSettings: Promise<ContractSettings>;

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

  getContractTransportList(contract: Contract): CompanyContact[] {
    return this.company.getTransportList().filter(c => contract.truckers.some(contact => contact.trucker.id == c.id));
  }

  async getContractByTicket(ticket: Ticket): Promise<Contract> {
    return ticket.contractRef ? getDoc(ticket.contractRef).then(res => res.data())
      : getDocs(query(this.getCollectionReference(), where('tickets', 'array-contains', ticket.ref), limit(1))).then(result => result.docs[0].data());
  }

  async getContractSettings(date?: Date): Promise<ContractSettings> {
    if(!date && this.contractSettings) return this.contractSettings;

    const collectionRef = collection(this.company.getCollectionReference(), 'settings').withConverter(ContractSettings.converter);

    const constraints: QueryConstraint[] = [];
    if(date) constraints.push(where('date', '<=', date));
    constraints.push(orderBy('date', 'desc'));
    constraints.push(limit(1));

    const collectionQuery = query(collectionRef, ...constraints);
    
    const docPromise = getDocs(collectionQuery).then(snap => {
      if(snap.empty) return new ContractSettings(doc(collectionRef));

      return snap.docs[0].data();
    });

    if(!date) this.contractSettings = docPromise;
    return docPromise;
  }

  
  public async getList({
    count,
    type,
    orderField,
    tags,
    status,
    sortOrder = 'desc',
    startAfterObject,
    beforeDate,
    afterDate
  }: getContractsListParams): Promise<Contract[]> {

    const constraints: QueryConstraint[] = [];
    
    if(count) constraints.push(limit(count));
    if(type) constraints.push(where('type', 'in', type));
    if(tags) constraints.push(where('tags', 'array-contains-any', tags));
    if(afterDate) constraints.push(where('date', '>=', afterDate));
    if(beforeDate) constraints.push(where('date', '<=', beforeDate));
    if(status) constraints.push(where('status', 'in', status));
    if(orderField) constraints.push(orderBy(orderField, sortOrder));
    if(startAfterObject) constraints.push(startAfter(startAfterObject.ref));

    const list = await getDocs(
      query(
        this.getCollectionReference(),
        ...constraints
      )
    );

    return list.docs.map(doc => doc.data());
  }
}

export type getContractsListParams = {
  count?: number;
  type?: string[],
  orderField?: string,
  tags?: string[],
  status?: string[]
  sortOrder?: OrderByDirection,
  startAfterObject?: Contract,
  beforeDate?: Date,
  afterDate?: Date,
}