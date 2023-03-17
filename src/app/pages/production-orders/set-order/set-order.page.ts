import { Component, OnInit } from '@angular/core';
import { doc, DocumentReference, Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { ProductionOrder } from '@shared/classes/production-order';
import { InvoiceItem } from '@shared/classes/invoice_item';
import { Plant } from '@shared/classes/plant';
import { User } from '@shared/classes/user';

@Component({
  selector: 'app-set-order',
  templateUrl: './set-order.page.html',
  styleUrls: ['./set-order.page.scss'],
})
export class SetOrderPage implements OnInit {
  order: ProductionOrder;

  invoiceItems$: Promise<InvoiceItem[]>;
  plants$: Promise<Plant[]>

  constructor(
    private session: SessionInfo,
    private db: Firestore
  ) { }

  ngOnInit() {
    this.order = new ProductionOrder();
    this.order.orderInfo = [];
    this.addItem();

    this.invoiceItems$ = InvoiceItem.getList(this.db, this.session.getCompany());
    this.plants$ = Plant.getPlantList(this.db, this.session.getCompany());
  }

  addItem(): void {
    this.order.orderInfo.push({
      quantity: null,
      name: null,
      itemRef: null,
      affectsInventory: null
    });
  }

  async itemSelected(item: orderItem): Promise<void> {
    const newItem = (await this.invoiceItems$).find(item => item.ref == this.order.orderInfo[0].itemRef);
    item.name = newItem.name;
  }

  deleteItem(index: number): void {
    this.order.orderInfo.splice(index, 1)
  }

  async submit() {
    this.order.date = new Date();
    this.order.status = "pending";
    this.order.orderOwner = User.getDocumentReference(this.db, this.session.getUser().uid);
    this.order.orderOwnerName = this.session.getUser().name;
    this.order.ref = doc(ProductionOrder.getCollectionReference(this.db, this.session.getCompany()));
    this.order.id = 1; //TODO
    this.order.fulfilledDate = null;
    this.order.docRefs = [];
    
    console.log(this.order);
    //this.order.set();
  }
}

interface orderItem {
  quantity: number;
  name: string;
  itemRef: DocumentReference;
  affectsInventory: boolean;
}