import { Injectable } from '@angular/core';
import { collection, CollectionReference, doc, Firestore, getDocs, getDocsFromServer, limit, query, QueryConstraint, runTransaction, serverTimestamp, setDoc } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { LoadOrder } from '@shared/classes/load-orders.model';
import { orderBy } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class LoadOrderService {
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

  public async add(newDoc: LoadOrder) {
    const lastOrderQuery = query(this.getCollectionReference(), orderBy('id', 'desc'), limit(1));
    const lastOrder = await getDocsFromServer(lastOrderQuery);
    const newRef = doc(this.getCollectionReference());
    newDoc.id = lastOrder.empty ? 1 : lastOrder.docs[0].get('id') + 1;
    newDoc.status = 'pending';
    const data = LoadOrder.converter.toFirestore(newDoc);
    data.date = serverTimestamp();
    setDoc(newRef, data);
  }
}
