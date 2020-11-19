import { ModalController } from '@ionic/angular';

import { Component, OnInit } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { ShowDetailsComponent } from '../show-details/show-details.component';

@Component({
  selector: 'app-contract-modal',
  templateUrl: './contract-modal.component.html',
  styleUrls: ['./contract-modal.component.scss']
})
export class ContractModalComponent implements OnInit {

  constructor(
    private bottomSheet: MatBottomSheet,
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
  }
  closeModal = (): void => {
    this.modalController.dismiss();
  }
  openDetailsSheet = (): void => {
    this.bottomSheet.open(ShowDetailsComponent);
  }
}
