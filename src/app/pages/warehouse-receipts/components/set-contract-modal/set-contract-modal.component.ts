import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WarehouseReceiptContract } from '@shared/classes/WarehouseReceiptGroup';

@Component({
  selector: 'app-set-contract-modal',
  templateUrl: './set-contract-modal.component.html',
  styleUrls: ['./set-contract-modal.component.scss'],
})
export class SetContractModalComponent implements OnInit {
  @Input() contract: ContractData;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    console.log(this.contract);
  }

  public cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }

  public confirm() {
    return this.modalController.dismiss(this.contract, 'confirm');
  }
}

interface ContractData {
  basePrice?: number;
  futurePrice?: number;
  id?: string;
  pdfReference?: string;
  startDate: Date;
  status?: string;
}
