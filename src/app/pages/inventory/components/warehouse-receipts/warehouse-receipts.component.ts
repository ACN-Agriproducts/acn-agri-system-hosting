import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentReference } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { NewWarehouseReceiptModalComponent } from '../new-warehouse-receipt-modal/new-warehouse-receipt-modal.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-warehouse-receipts',
  templateUrl: './warehouse-receipts.component.html',
  styleUrls: ['./warehouse-receipts.component.scss'],
})
export class WarehouseReceiptsComponent implements OnInit {
  warehouseReceiptList: WarehouseReceiptDoc[] = [];
  warehouseReceiptCollectionRef: AngularFirestoreCollection;
  @Input() productList: any[];

  constructor(
    private modalController: ModalController,
    private db: AngularFirestore,
    private localStorage: Storage,
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany').then(company => {
      this.warehouseReceiptCollectionRef = this.db.collection(`companies/${company}/warehouseReceipts`);
      this.warehouseReceiptCollectionRef.get().subscribe(receiptList => {
        receiptList.forEach(receipt => {
          const tempReceipt = receipt.data() as WarehouseReceiptDoc;
          tempReceipt.ref = receipt.ref;
          tempReceipt.startDate = receipt.get('startDate').toDate(); 
          this.warehouseReceiptList.push(tempReceipt);
        });
      });
    });
  }

  public async newWarehouseReceiptModal() {
    const modal = await this.modalController.create({
      component: NewWarehouseReceiptModalComponent,
      componentProps: {
        productList: this.productList
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log(`Data: ${data.quantity}, ${data.id}, ${data.startDate}, ${data.grain}, ${data.bushels}, ${data.futurePrice}`);
      let tempId = data.id;
      for (let i = 0; i < data.quantity; i++, tempId++) {
        this.addWarehouseReceipts({id: tempId, startDate: data.startDate, status: 'active', grain: data.grain, bushels: data.bushels, futurePrice: data.futurePrice});
      };
    }
  }

  public async addWarehouseReceipts(data: any) {
    this.warehouseReceiptCollectionRef.add(data).then(res => {
      const tempReceipt = {...data, ref: res};
      this.warehouseReceiptList.push(tempReceipt);
      console.log("Warehouse Receipt Successfully Added");
    });
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
