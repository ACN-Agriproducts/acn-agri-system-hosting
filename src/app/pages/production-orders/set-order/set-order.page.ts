import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { doc, Firestore, getDocsFromServer, limit, orderBy, query } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { orderItem, orderItemInfo, ProductionOrder } from '@shared/classes/production-order';
import { InvoiceItem } from '@shared/classes/invoice_item';
import { Plant } from '@shared/classes/plant';
import { User } from '@shared/classes/user';
import { Product } from '@shared/classes/product';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-set-order',
  templateUrl: './set-order.page.html',
  styleUrls: ['./set-order.page.scss'],
})
export class SetOrderPage implements OnInit {
  @ViewChild('printButton', { read: ElementRef }) printButton: ElementRef<HTMLElement>;
  @ViewChild('orderForm') orderForm: NgForm;

  order: ProductionOrder;
  currentPlant: Plant;

  invoiceItems$: Promise<InvoiceItem[]>;
  productsList$: Promise<Product[]>;
  plants$: Promise<Plant[]>;

  editing: boolean = false;

  constructor(
    private db: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    private session: SessionInfo,
    private snack: SnackbarService,
  ) { }

  ngOnInit() {
    this.invoiceItems$ = InvoiceItem.getList(this.db, this.session.getCompany());
    this.plants$ = Plant.getPlantList(this.db, this.session.getCompany());
    this.productsList$ = Product.getProductList(this.db, this.session.getCompany());

    const orderId = this.route.snapshot.paramMap.get('id');

    if (!orderId) {
      return this.orderInit();
    }

    this.editing = true;
    ProductionOrder.getOrder(this.db, this.session.getCompany(), +orderId)
    .then(order => {
      this.order = order;
      this.plantChange(this.order.plant.id);
    })
    .catch(error => {
      console.error(error);
      this.snack.open("Could not retrieve document.", "error");
      this.router.navigate(['/dashboard/production-orders']);
    });
  }

  orderInit(): void {
    this.order = new ProductionOrder();
    this.order.date = new Date();
    this.order.orderInfo = [];
    this.order.type = 'default';
    this.addItem();
  }

  async plantChange(plantId: string): Promise<void> {
    this.currentPlant = (await this.plants$).find(plant => plant.ref.id === plantId);
    this.order.plant = this.currentPlant.ref.withConverter(Plant.converter);
  }

  addItem(): void {
    this.order.orderInfo.push(new orderItem({
      quantity: null,
      name: null,
      itemRef: null,
      affectsInventory: null
    }));
  }

  async itemSelected(newItemId: string, item: orderItem): Promise<void> {
    const newItem = (await this.invoiceItems$).find(invoiceItem => invoiceItem.ref.id === newItemId);

    item.name = newItem.name;
    item.itemRef = newItem.ref;
    item.inventoryInfo = [];

    newItem.inventoryInfo.info.forEach(inventoryInfoItem => {
      item.inventoryInfo.push(inventoryInfoItem);
    });
  }

  deleteItem(index: number): void {
    this.order.orderInfo.splice(index, 1);
  }

  affectsInventoryChange(item: orderItem) {
    if (!item.affectsInventory) {
      this.itemSelected(item.itemRef.id, item);
    }
  }

  addItemInfo(item: orderItem) {
    item.inventoryInfo.push(new orderItemInfo({}));
  }

  deleteItemInfo(item: orderItem, index: number) {
    item.inventoryInfo.splice(index, 1);
  }

  submit() {
    if (this.orderForm.invalid) {
      this.orderForm.control.markAllAsTouched();
      this.snack.open("Fields required.", "warn");
      return;
    }

    if (this.editing) {
      this.order.set().then(() => {
        this.router.navigate(["/dashboard/production-orders"]);
        this.snack.open("Order successfully updated", "success");
      }).catch(error => {
        console.error(error);
        this.snack.open("Submit unsuccessful", "error");
      });
      return;
    }

    this.order.status = "pending";
    this.order.orderOwner = User.getDocumentReference(this.db, this.session.getUser().uid);
    this.order.orderOwnerName = this.session.getUser().name;
    this.order.ref = doc(ProductionOrder.getCollectionReference(this.db, this.session.getCompany()));
    this.order.fulfilledDate = null;
    this.order.docRefs = [];

    const queryLast = query(
      ProductionOrder.getCollectionReference(this.db, this.session.getCompany()),
      orderBy("id", "desc"), limit(1)
    );
    getDocsFromServer(queryLast).then(result => {
      this.order.id = result.empty ? 1 : result.docs[0].data().id + 1;
      this.printButton.nativeElement.click();

      return this.order.set();
    }).then(() => {
      this.router.navigate(["/dashboard/production-orders"]);
      this.snack.open("Order successfully updated", "success");
    }).catch(error => {
      console.error(error);
      this.snack.open("Submit unsuccessful", "error");
    });
  }
}