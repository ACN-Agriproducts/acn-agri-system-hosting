import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UniqueWarehouseReceiptIdService } from '../unique-warehouse-receipt-id/unique-warehouse-receipt-id.service';

@Component({
  selector: 'app-new-warehouse-receipt-modal',
  templateUrl: './new-warehouse-receipt-modal.component.html',
  styleUrls: ['./new-warehouse-receipt-modal.component.scss'],
})
export class NewWarehouseReceiptModalComponent implements OnInit {
  @Input() productList: any[];
  @Input() warehouseReceiptCollectionRef: AngularFirestoreCollection;

  public warehouseReceiptForm: UntypedFormGroup;

  constructor(
    private modalController: ModalController, 
    private fb: UntypedFormBuilder,
    private uniqueId: UniqueWarehouseReceiptIdService,
  ) {}

  ngOnInit() {
    this.uniqueId.setGetterFunction(this.getWarehouseReceiptCollection.bind(this));

    this.warehouseReceiptForm = this.fb.group({
      quantity: [1, Validators.required],
      id: [, [Validators.required], this.uniqueId.validate.bind(this.uniqueId)],
      startDate: [new Date(), Validators.required],
      product: ['', Validators.required],
      bushelQuantity: [10_000, Validators.required],
      purchasedFuturePrice: [, Validators.required],
    });
  }

  public cancel () {
    return this.modalController.dismiss(null, 'cancel');
  }

  public confirm () {
    return this.modalController.dismiss(this.warehouseReceiptForm.getRawValue(), 'confirm');
  }

  public getWarehouseReceiptCollection(): [AngularFirestoreCollection, number] {
    return [this.warehouseReceiptCollectionRef, this.warehouseReceiptForm.get('quantity').value];
  }

}
