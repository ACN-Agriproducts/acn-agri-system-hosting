import { Component, OnInit } from '@angular/core';
import { doc, Firestore, getDocsFromServer, limit, orderBy, query } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { orderItem, orderItemInfo, ProductionOrder } from '@shared/classes/production-order';
import { InvoiceItem } from '@shared/classes/invoice_item';
import { Plant } from '@shared/classes/plant';
import { User } from '@shared/classes/user';
import { Product } from '@shared/classes/product';
import { Router } from '@angular/router';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-set-order',
  templateUrl: './set-order.page.html',
  styleUrls: ['./set-order.page.scss'],
})
export class SetOrderPage implements OnInit {
  order: ProductionOrder;
  plant: Plant;

  invoiceItems$: Promise<InvoiceItem[]>;
  productsList$: Promise<Product[]>;
  plants$: Promise<Plant[]>

  constructor(
    private session: SessionInfo,
    private db: Firestore,
    private router: Router,
    private snack: SnackbarService
  ) { }

  ngOnInit() {
    this.order = new ProductionOrder();
    this.order.date = new Date();
    this.order.orderInfo = [];
    this.order.type = 'default';
    this.addItem();

    this.invoiceItems$ = InvoiceItem.getList(this.db, this.session.getCompany());
    this.plants$ = Plant.getPlantList(this.db, this.session.getCompany());
    this.productsList$ = Product.getProductList(this.db, this.session.getCompany());
  }

  async plantChange(): Promise<void> {
    this.plant = (await this.plants$).find(p => p.ref == this.order.plant);
  }

  addItem(): void {
    this.order.orderInfo.push(new orderItem({
      quantity: null,
      name: null,
      itemRef: null,
      affectsInventory: null
    }));
  }

  async itemSelected(item: orderItem): Promise<void> {
    const newItem = (await this.invoiceItems$).find(invoiceItem => invoiceItem.ref == item.itemRef);

    item.name = newItem.name;
    item.inventoryInfo = [];

    newItem.inventoryInfo.info.forEach(inventoryInfoItem => {
      item.inventoryInfo.push(inventoryInfoItem);
    });
  }

  deleteItem(index: number): void {
    this.order.orderInfo.splice(index, 1)
  }

  affectsInventoryChange(item: orderItem) {
    if (item.affectsInventory) {
      item.inventoryInfo = [new orderItemInfo({})]
    }
    else {
      item.inventoryInfo = null;
    }
  }

  addItemInfo(item: orderItem) {
    item.inventoryInfo.push(new orderItemInfo({}));
  }

  deleteItemInfo(item: orderItem, index: number) {
    item.inventoryInfo.splice(index, 1);
  }

  async submit() {
    this.order.status = "pending";
    this.order.orderOwner = User.getDocumentReference(this.db, this.session.getUser().uid);
    this.order.orderOwnerName = this.session.getUser().name;
    this.order.ref = doc(ProductionOrder.getCollectionReference(this.db, this.session.getCompany()));
    this.order.id = 1; //TODO
    this.order.fulfilledDate = null;
    this.order.docRefs = [];

    const queryLast = query(
      ProductionOrder.getCollectionReference(this.db, this.session.getCompany()), 
      orderBy("id", "desc"), limit(1)
    );
    getDocsFromServer(queryLast).then(result => {
      this.order.id = result.empty ? 1 :
        result.docs[0].data().id + 1;

      return this.order.set();
    }).then(() => {
      this.router.navigate(["dashboard/production-orders"]);
      this.snack.open("Order successfully updated", "success");
    }).catch(error => {
      this.snack.open("Submit unsuccessful", "error");
      console.error(error);
    });
  }
}