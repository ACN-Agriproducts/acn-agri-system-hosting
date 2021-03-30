import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-contact-modal',
  templateUrl: './show-contact-modal.component.html',
  styleUrls: ['./show-contact-modal.component.scss']
})
export class ShowContactModalComponent implements OnInit {

  @Input() data;

  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit(): void {
  }

  public closeModal = () => {
    this.modalController.dismiss();
  }
}
