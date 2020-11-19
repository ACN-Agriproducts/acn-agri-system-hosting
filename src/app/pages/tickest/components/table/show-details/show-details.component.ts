import { ModalTicketComponent } from './../../modal-ticket/modal-ticket.component';
import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-details',
  templateUrl: './show-details.component.html',
  styleUrls: ['./show-details.component.scss']
})
export class ShowDetailsComponent implements OnInit {

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
  }
  public closeModal = () => {
    this.modalController.dismiss();
  }
  public openTicket = async () => {
    const modal = await this.modalController.create({
      component: ModalTicketComponent
    })
    return await modal.present();
  }
}
