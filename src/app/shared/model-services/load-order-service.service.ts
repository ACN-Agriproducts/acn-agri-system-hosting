import { Injectable } from '@angular/core';
import { collection, CollectionReference, Firestore, getDocs, query, QueryConstraint } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { LoadOrder } from '@shared/classes/load-orders.model';

@Injectable({
  providedIn: 'root'
})
export class LoadOrderServiceService {
  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  public getCollectionReference(): CollectionReference<LoadOrder> {
    return collection(this.db, 'companies', this.session.getCompany(), 'loadOrders').withConverter(LoadOrder.converter);
  }

  public async getList(...constraints: QueryConstraint[]): Promise<LoadOrder[]> {
    const list = await getDocs(query(this.getCollectionReference(), ...constraints));
    return list.docs.map(order => order.data());
  }
}
