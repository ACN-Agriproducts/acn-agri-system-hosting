import { Injectable } from '@angular/core';
import { collection, CollectionReference, doc, Firestore, getDocs, getDocsFromServer, limit, query, QueryConstraint, setDoc, startAfter, orderBy, getCountFromServer, updateDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { LoadOrder, LoadOrderStatus } from '@shared/classes/load-orders.model';
import { LoadOrderDialogComponent } from 'src/app/modules/load-order-printables/load-order-dialog/load-order-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class LoadOrderService {
  constructor(
    private db: Firestore,
    private session: SessionInfo,
  ) { }

  public getCollectionReference(): CollectionReference<LoadOrder> {
    return collection(this.db, 'companies', this.session.getCompany(), 'loadOrders').withConverter(LoadOrder.converter);
  }

  public async getList(amount: number, startAfterObject?: LoadOrder): Promise<LoadOrder[]> {
    const constraints: QueryConstraint[] = [
      orderBy('id', 'desc'),
      limit(amount)
    ];

    if(startAfterObject) constraints.push(startAfter(startAfterObject.ref));

    const list = await getDocs(
      query(
        this.getCollectionReference(), 
        ...constraints
      )
    );

    return list.docs.map(order => order.data());
  }

  public async getCount(): Promise<number> {
    return getCountFromServer(this.getCollectionReference()).then(result => result.data().count);
  }

  public async add(newDoc: LoadOrder) {
    const lastOrderQuery = query(this.getCollectionReference(), orderBy('id', 'desc'), limit(1));
    const lastOrder = await getDocsFromServer(lastOrderQuery);
    newDoc.id = lastOrder.empty ? 1 : lastOrder.docs[0].get('id') + 1;
    const newRef = doc(this.getCollectionReference());
    setDoc(newRef, newDoc);
  }
  
  public createNew(): LoadOrder {
    const newDoc = new LoadOrder(null)
    newDoc.status = 'pending';
    return newDoc;
  }
}
