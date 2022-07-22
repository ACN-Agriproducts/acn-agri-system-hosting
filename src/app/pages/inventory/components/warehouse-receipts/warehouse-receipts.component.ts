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
  @Input() currentPlantName: string;
  
  public warehouseReceiptList: WarehouseReceiptDoc[] = [];
  public warehouseReceiptCollectionRef: AngularFirestoreCollection;
  public queryStatus: string[] = ["active", "sold", "financing", "cancelled"];
  public today: Date = new Date();
  

  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController,
    private db: AngularFirestore,
    private localStorage: Storage,
  ) { }

  ngOnInit() {
    this.getWarehouseReceipts();
  }

  public getWarehouseReceipts = async () => {
    let tempReceiptList = [];

    this.localStorage.get('currentCompany').then(currentCompany => {
      this.warehouseReceiptCollectionRef = this.db.collection(`companies/${currentCompany}/plants/${this.currentPlantName}/warehouseReceipts`, 
        query => query.where('status', 'in', this.queryStatus)
                      .orderBy('id', 'asc'));

      this.warehouseReceiptCollectionRef.get().subscribe(receiptList => {
        receiptList.forEach(receiptFirebaseDoc => {
          const tempReceipt = receiptFirebaseDoc.data() as WarehouseReceiptDoc;
          tempReceipt.ref = receiptFirebaseDoc.ref;
          tempReceipt.startDate = receiptFirebaseDoc.get('startDate').toDate();  // firebase uses timestamps for dates
          tempReceipt.endDate = receiptFirebaseDoc.get('endDate')?.toDate();
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

  public openStatusSelect = async (receipt: WarehouseReceiptDoc) => {
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
    const updateDoc: any = {status};

    // add endDate to cancelled receipts
    if (status === 'cancelled') {
      updateDoc.endDate = new Date();
    }

    receiptRef.update(updateDoc);
    this.getWarehouseReceipts();
  }
}

class WarehouseReceiptDoc {
  id: number;
  startDate: Date;
  endDate: Date | null;
  status: string;
  grain: string;
  bushels: number;
  futurePrice: number;
  ref: DocumentReference;
}
