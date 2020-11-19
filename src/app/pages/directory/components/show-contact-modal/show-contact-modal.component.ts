import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-contact-modal',
  templateUrl: './show-contact-modal.component.html',
  styleUrls: ['./show-contact-modal.component.scss']
})
export class ShowContactModalComponent implements OnInit {

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
  }

  public closeModal = () => {
    this.modalController.dismiss();
  }
}
