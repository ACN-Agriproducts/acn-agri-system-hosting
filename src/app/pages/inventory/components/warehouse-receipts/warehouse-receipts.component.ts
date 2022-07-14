import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference, DocumentReference } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { NewWarehouseReceiptModalComponent } from '../new-warehouse-receipt-modal/new-warehouse-receipt-modal.component';

@Component({
  selector: 'app-warehouse-receipts',
  templateUrl: './warehouse-receipts.component.html',
  styleUrls: ['./warehouse-receipts.component.scss'],
})
export class WarehouseReceiptsComponent implements OnInit {
  warehouseReceiptList: WarehouseReceiptDoc[] = [];
  warehouseReceiptCollectionRef: AngularFirestoreCollection<WarehouseReceiptDoc>;

  constructor(
    private modalController: ModalController,
    private db: AngularFirestore,
    private localStorage: Storage,
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany').then(company => {
      this.warehouseReceiptCollectionRef = this.db.collection<WarehouseReceiptDoc>(`companies/${company}/warehouseReceipts`);
      this.warehouseReceiptCollectionRef.get().subscribe(receiptList => {
        receiptList.forEach(receipt => {
          const tempReceipt = receipt.data();
          tempReceipt.ref = receipt.ref;
          this.warehouseReceiptList.push(tempReceipt);
        });
      });
    });
  }

  public async newWarehouseReceiptModal() {
    const modal = await this.modalController.create({
      component: NewWarehouseReceiptModalComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log(`Data: ${data.quantity}, ${data.id}, ${data.startDate}, ${data.grain}, ${data.futurePrice}`);
      this.addWarehouseReceipts(data);
    }
  }

  public async addWarehouseReceipts(data: any) {
    this.warehouseReceiptCollectionRef.add(data).then(res => {
      const tempReceipt = {...data, status: 'active', ref: res};
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
  futurePrice: number;
  ref: DocumentReference;
}
