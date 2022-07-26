import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController, PopoverController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Product } from '@shared/classes/product';
import { WarehouseReceipt } from '@shared/classes/warehouseReceipt';

@Component({
  selector: 'app-warehouse-receipts',
  templateUrl: './warehouse-receipts.page.html',
  styleUrls: ['./warehouse-receipts.page.scss'],
})
export class WarehouseReceiptsPage implements OnInit {

  constructor() { }

  ngOnInit() {

  }

}
