import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-new-warehouse-receipt-modal',
  templateUrl: './new-warehouse-receipt-modal.component.html',
  styleUrls: ['./new-warehouse-receipt-modal.component.scss'],
})
export class NewWarehouseReceiptModalComponent implements OnInit {
  @Input() productList: any[];

  public warehouseReceiptForm = this.fb.group({
    quantity: [1, Validators.required],
    id: [, Validators.required],
    startDate: [new Date(), Validators.required],
    grain: ['', Validators.required],
    bushels: [10_000, Validators.required],
    futurePrice: [, Validators.required]
  });

  constructor(private modalController: ModalController, private fb: FormBuilder) {}

  ngOnInit() {}

  cancel () {
    return this.modalController.dismiss(null, 'cancel');
  }

  confirm () {
    return this.modalController.dismiss(this.warehouseReceiptForm.getRawValue(), 'confirm');
  }

}
