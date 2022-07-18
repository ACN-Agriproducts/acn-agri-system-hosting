import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentReference } from '@angular/fire/compat/firestore';
import { ModalController, PopoverController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { NewWarehouseReceiptModalComponent } from '../new-warehouse-receipt-modal/new-warehouse-receipt-modal.component';
import { WarehouseReceiptStatusPopoverComponent } from '../warehouse-receipt-status-popover/warehouse-receipt-status-popover.component';

@Component({
  selector: 'app-warehouse-receipts',
  templateUrl: './warehouse-receipts.component.html',
  styleUrls: ['./warehouse-receipts.component.scss'],
})
export class WarehouseReceiptsComponent implements OnInit {
  @Input() productList: any[];

  public warehouseReceiptList: WarehouseReceiptDoc[] = [];
  public warehouseReceiptCollectionRef: AngularFirestoreCollection;
  public totalBushels: number = 0;
  public queryStatus: string[] = ["active", "sold", "financing", "paid-closed"];


  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private db: AngularFirestore,
    private localStorage: Storage,
  ) { }

  ngOnInit() {
    this.initWarehouseReceipts();
  }

  public initWarehouseReceipts = async () => {
    let tempTotalBushels = 0;
    this.localStorage.get('currentCompany').then(company => {
      this.warehouseReceiptCollectionRef = this.db.collection(`companies/${company}/warehouseReceipts`, query => query.orderBy('id', 'asc'));

      this.warehouseReceiptCollectionRef.get().subscribe(receiptList => {
        receiptList.forEach(receiptFirebaseDoc => {
          const tempReceipt = receiptFirebaseDoc.data() as WarehouseReceiptDoc;
          tempReceipt.ref = receiptFirebaseDoc.ref;
          tempReceipt.startDate = receiptFirebaseDoc.get('startDate').toDate();  // firebase uses timestamps for dates
          this.warehouseReceiptList.push(tempReceipt);

          // total should only be for receipts that aren't paid/closed
          if (tempReceipt.status !== 'paid-closed') {
            tempTotalBushels += tempReceipt.bushels;
          }
        });

        this.totalBushels = tempTotalBushels;
      });
    });
  }

  public getWarehouseReceipts = async () => {
    let tempReceiptList = [];

    this.localStorage.get('currentCompany').then(company => {
      this.warehouseReceiptCollectionRef = this.db.collection(`companies/${company}/warehouseReceipts`, query => query.where('status', 'in', this.queryStatus).orderBy('id', 'asc'));
      this.warehouseReceiptCollectionRef.get().subscribe(receiptList => {
        receiptList.forEach(receiptFirebaseDoc => {
          const tempReceipt = receiptFirebaseDoc.data() as WarehouseReceiptDoc;
          tempReceipt.ref = receiptFirebaseDoc.ref;
          tempReceipt.startDate = receiptFirebaseDoc.get('startDate').toDate();  // firebase uses timestamps for dates
          tempReceiptList.push(tempReceipt);
        });

        this.warehouseReceiptList = tempReceiptList;
      });
    });
  }

  public segmentChanged = async (event: any) => {
    this.queryStatus = event.detail.value.split(',');
    this.getWarehouseReceipts();
  }

  public newWarehouseReceiptModal = async () => {
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
      for (let i = 0; i < data.quantity; i++) {
        this.addWarehouseReceipts({id: data.id + i, startDate: data.startDate, status: 'active', grain: data.grain, bushels: data.bushels, futurePrice: data.futurePrice});
      };
    }
  }

  public addWarehouseReceipts = async (data: any) => {
    this.warehouseReceiptCollectionRef.add(data).then(res => {
      // add new receipt to html
      const tempReceipt = {...data, ref: res};
      this.warehouseReceiptList.push(tempReceipt);

      // update totalBushels
      this.totalBushels += tempReceipt.bushels;

      console.log("Warehouse Receipt Successfully Added");
    });
  }

  public openStatusSelect = async (receipt: WarehouseReceiptDoc) => {
    if (receipt.status === 'paid-closed') {
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

    if (receipt.status === 'paid-closed') {
      this.totalBushels -= receipt.bushels;
    }
  }

  public updateWarehouseReceipt = async (status: string, receiptRef: DocumentReference) => {
    receiptRef.update({ status });
    console.log("Warehouse receipt successfully updated.");
  }
}

class WarehouseReceiptDoc {
  id: string;
  startDate: Date;
  status: string;
  grain: string;
  bushels: number;
  futurePrice: number;
  ref: DocumentReference;
}
