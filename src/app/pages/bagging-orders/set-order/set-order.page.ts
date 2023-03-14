import { Component, OnInit } from '@angular/core';
import { doc, Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { BaggingOrder } from '@shared/classes/bagging-order';
import { InvoiceItem } from '@shared/classes/invoice_item';
import { Plant } from '@shared/classes/plant';
import { User } from '@shared/classes/user';

@Component({
  selector: 'app-set-order',
  templateUrl: './set-order.page.html',
  styleUrls: ['./set-order.page.scss'],
})
export class SetOrderPage implements OnInit {
  order: BaggingOrder;
  plant: Plant;

  invoiceItems$: Promise<InvoiceItem[]>;
  plants$: Promise<Plant[]>

  constructor(
    private session: SessionInfo,
    private db: Firestore
  ) { }

  ngOnInit() {
    this.order = new BaggingOrder();
    this.order.orderInfo = [{
      quantity: null,
      itemRef: null,
      affectsInventory: null
    }];

    this.invoiceItems$ = InvoiceItem.getList(this.db, this.session.getCompany());
    this.plants$ = Plant.getPlantList(this.db, this.session.getCompany());
  }

  submit() {
    this.order.date = new Date();
    this.order.status = "pending";
    this.order.orderOwner = User.getDocumentReference(this.db, this.session.getUser().uid);
    this.order.orderOwnerName = this.session.getUser().name;
    this.order.ref = doc(BaggingOrder.getCollectionReference(this.db, this.session.getCompany()));
  }

}
