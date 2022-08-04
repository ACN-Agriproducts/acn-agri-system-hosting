import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { WarehouseReceiptGroup } from '@shared/classes/WarehouseReceiptGroup';
import { UniqueWarehouseReceiptIdService } from '../components/unique-warehouse-receipt-id/unique-warehouse-receipt-id.service';

@Component({
  selector: 'app-create-warehouse-receipt-group',
  templateUrl: './create-warehouse-receipt-group.page.html',
  styleUrls: ['./create-warehouse-receipt-group.page.scss'],
})
export class CreateWarehouseReceiptGroupPage implements OnInit {
  public warehouseReceiptGroupForm: FormGroup;
  public warehouseReceiptCollectionRef: AngularFirestoreCollection;
  public currentCompany: string;

  constructor(
    private db: AngularFirestore,
    private fb: FormBuilder,
    private localStorage: Storage,
    private navController: NavController,
    private uniqueId: UniqueWarehouseReceiptIdService,
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany').then(company => {
      this.currentCompany = company;
      this.warehouseReceiptCollectionRef = this.db.collection(WarehouseReceiptGroup.getCollectionReference(this.db, company));
    });

    this.uniqueId.setGetterFunction(this.getWarehouseReceiptCollection.bind(this));

    this.warehouseReceiptGroupForm = this.fb.group({
      quantity: [1, Validators.required],
      id: ['', [Validators.required], this.uniqueId.validate.bind(this.uniqueId)],
      startDate: [new Date(), Validators.required],
      product: ['', Validators.required],
      bushelQuantity: [10_000, Validators.required]
    });
  }

  public cancel = () => {
    this.navController.navigateBack('/dashboard/warehouse-receipts');
  }

  public confirm = () => {
    //
  }

  public getWarehouseReceiptCollection = (): [AngularFirestoreCollection, number] => {
    return [this.warehouseReceiptCollectionRef, this.warehouseReceiptGroupForm.get('quantity').value];
  }

}
