import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-set-contract-modal',
  templateUrl: './set-contract-modal.component.html',
  styleUrls: ['./set-contract-modal.component.scss'],
})
export class SetContractModalComponent implements OnInit {
  public contract: ConstructorData = { startDate: new Date() };

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  public cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }

  public confirm() {
    return this.modalController.dismiss(this.contract, 'confirm');
  }
}

interface ConstructorData {
  basePrice?: number;
  futurePrice?: number;
  id?: number;
  startDate: Date;
  pdfReference?: string;
}
