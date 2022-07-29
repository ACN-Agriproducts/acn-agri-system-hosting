import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentReference } from '@angular/fire/compat/firestore';
import { ModalController, PopoverController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Product } from '@shared/classes/product';
import { WarehouseReceipt } from '@shared/classes/warehouseReceipt';
import { NewWarehouseReceiptModalComponent } from '../new-warehouse-receipt-modal/new-warehouse-receipt-modal.component';
import { WarehouseReceiptStatusPopoverComponent } from '../warehouse-receipt-status-popover/warehouse-receipt-status-popover.component';

@Component({
  selector: 'app-warehouse-receipts-table',
  templateUrl: './warehouse-receipts.component.html',
  styleUrls: ['./warehouse-receipts.component.scss'],
})
export class WarehouseReceiptsComponent implements OnInit {

  public warehouseReceiptList: WarehouseReceipt[] = [];
  public warehouseReceiptCollectionRef: AngularFirestoreCollection;
  public queryStatus: string[] = ["pending", "active", "closed", "cancelled"];
  public today: Date = new Date();
  public currentCompany: string;
  public currentPlant: string;
  public productList: Product[];
  

  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private db: AngularFirestore,
    private localStorage: Storage,
  ) {

  }

  ngOnInit() {
    this.localStorage.get('currentCompany').then(company => {
      this.currentCompany = company;
      return this.localStorage.get('currentPlant');
    }).then(plant => {
      this.currentPlant = plant;
      return WarehouseReceipt.getWarehouseReceipts(
        this.db, 
        this.currentCompany, 
        this.currentPlant
      )
    }).then(async result => {
      this.warehouseReceiptList = result;
      // this.warehouseReceiptCollectionRef = this.db.collection(WarehouseReceipt.getWRCollectionReference(this.db, this.currentCompany, this.currentPlant));
      this.warehouseReceiptCollectionRef = this.db.collection(result[0].getCollectionReference());
      this.productList = await Product.getProductList(this.db, this.currentCompany);
    });
  }

  public segmentChanged = async (event: any) => {
    this.queryStatus = event.detail.value.split(',');
    this.warehouseReceiptList = await WarehouseReceipt.getWarehouseReceipts(this.db, 
      this.currentCompany, 
      this.currentPlant, 
      query => query.where('status', 'in', this.queryStatus)
    );
  }

  public generateWarehouseReceiptsModal = async () => {
    const modal = await this.modalController.create({
      component: NewWarehouseReceiptModalComponent,
      componentProps: {
        productList: this.productList,
        warehouseReceiptCollectionRef: this.warehouseReceiptCollectionRef
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.addWarehouseReceipts(data);
    }
  }

  public addWarehouseReceipts = async (data: any) => {
    for (let i = 0; i < data.quantity; i++) {
      this.addWarehouseReceipt({
        id: data.id + i, 
        startDate: data.startDate, 
        status: 'active', 
        grain: data.grain, 
        bushels: data.bushels, 
        futurePrice: data.futurePrice
      });
    };
  }

  public addWarehouseReceipt = async (receiptObject: any) => {
    this.warehouseReceiptCollectionRef.add(receiptObject).then(result => {
      // add new receipt to html
      const tempReceipt = {
        ...receiptObject, 
        ref: result
      };
      this.warehouseReceiptList.push(tempReceipt);
      this.warehouseReceiptList.sort((a,b) => a.id - b.id);
    });
  }

  public openStatusSelect = async (receipt: WarehouseReceipt) => {
    if (receipt.status === 'cancelled') {
      return;
    }

    const popover = await this.popoverController.create({
      component: WarehouseReceiptStatusPopoverComponent,
      componentProps: {
        status: receipt.status
      },
      backdropDismiss: false,
      showBackdrop: true,
    });
    popover.present();

    const { data } = await popover.onWillDismiss();

    this.updateWarehouseReceipt(data, receipt.ref);
    receipt.status = data ?? receipt.status;
  }

  public updateWarehouseReceipt = async (status: string, receiptRef: DocumentReference) => {
    const updateDoc: any =  { status };

    // add endDate to cancelled receipts
    if (status === 'cancelled') {
      updateDoc.endDate = new Date();
    }

    receiptRef.update(updateDoc);
    this.warehouseReceiptList = await WarehouseReceipt.getWarehouseReceipts(
      this.db, 
      this.currentCompany, 
      this.currentPlant
    );
  }
}

