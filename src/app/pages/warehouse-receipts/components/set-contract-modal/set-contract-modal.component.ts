import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-set-contract-modal',
  templateUrl: './set-contract-modal.component.html',
  styleUrls: ['./set-contract-modal.component.scss'],
})
export class SetContractModalComponent implements OnInit {

  public contractForm: FormGroup;

  constructor(private fb: FormBuilder, private modalController: ModalController) { }

  ngOnInit() {
    this.contractForm = this.fb.group({
      basePrice: [, Validators.required],
      futurePrice: [, Validators.required],
      id: [, Validators.required],
      startDate: [new Date(), Validators.required],
    });
  }

  public cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }

  public confirm() {
    return this.modalController.dismiss(this.contractForm.getRawValue(), 'confirm');
  }

}
