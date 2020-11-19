import { ModalController } from '@ionic/angular';
import { ContractModalComponent } from './components/contract-modal/contract-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.page.html',
  styleUrls: ['./contracts.page.scss'],
})
export class ContractsPage implements OnInit {

  constructor(
    private modal: MatDialog,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  public openModal = async () => {
    // this.modal.open(ContractModalComponent, {
    //   autoFocus: false
    // });
    const modal = await this.modalController.create({
      component: ContractModalComponent,
      cssClass: 'modal-contract',
    });
    return await modal.present();
  }
}
