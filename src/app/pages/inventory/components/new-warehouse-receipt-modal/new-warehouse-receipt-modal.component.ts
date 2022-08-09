import { Component, Input, OnInit } from '@angular/core';
import { CollectionReference } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UniqueWarehouseReceiptIdService } from '../unique-warehouse-receipt-id.service';

@Component({
  selector: 'app-new-warehouse-receipt-modal',
  templateUrl: './new-warehouse-receipt-modal.component.html',
  styleUrls: ['./new-warehouse-receipt-modal.component.scss'],
})
export class NewWarehouseReceiptModalComponent implements OnInit {
  @Input() productList: any[];
  @Input() warehouseReceiptCollectionRef: CollectionReference;

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
      grain: ['', Validators.required],
      bushels: [10_000, Validators.required],
      futurePrice: [, Validators.required],
    });
  }

  public cancel () {
    return this.modalController.dismiss(null, 'cancel');
  }

  public confirm () {
    return this.modalController.dismiss(this.warehouseReceiptForm.getRawValue(), 'confirm');
  }

  public getWarehouseReceiptCollection(): [CollectionReference, number] {
    return [this.warehouseReceiptCollectionRef, this.warehouseReceiptForm.get('quantity').value];
  }

}
