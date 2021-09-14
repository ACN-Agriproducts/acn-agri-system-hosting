import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-modal-ticket',
  templateUrl: './modal-ticket.component.html',
  styleUrls: ['./modal-ticket.component.scss']
})
export class ModalTicketComponent implements OnInit {
  @Input() ticketId: string;
  @Input() ticket: any;

  pdfLink: Observable<string | null>;
  imageTicketList: Observable<string | null>[] = [];

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    loop: true
  };
  constructor(
    private modalController: ModalController,
    private storage: AngularFireStorage
  ) { }

  ngOnInit(): void {
    if(this.ticket.pdfLink != null) {
      this.pdfLink = this.storage.ref(this.ticket.pdflink).getDownloadURL();
    }

    if(this.ticket.imageLinks != null) {
      this.ticket.imageLinks.forEach(element => {
        this.imageTicketList.push(this.storage.ref(element).getDownloadURL());
      });
    }
  }
  
  public closeModal = (): void => {
    this.modalController.dismiss();
  }

}
