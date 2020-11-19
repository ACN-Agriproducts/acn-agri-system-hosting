import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-ticket',
  templateUrl: './modal-ticket.component.html',
  styleUrls: ['./modal-ticket.component.scss']
})
export class ModalTicketComponent implements OnInit {
  slideOpts = {
    initialSlide: 1,
    speed: 400,
    loop: true
  };
  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
  }
  public closeModal = (): void => {
    this.modalController.dismiss();
  }

}
