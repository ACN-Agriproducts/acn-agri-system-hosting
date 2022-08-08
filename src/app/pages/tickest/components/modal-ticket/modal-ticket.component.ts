import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Ticket } from '@shared/classes/ticket';
import { Contract } from '@shared/classes/contract';
import { Contact } from '@shared/classes/contact';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-modal-ticket',
  templateUrl: './modal-ticket.component.html',
  styleUrls: ['./modal-ticket.component.scss']
})
export class ModalTicketComponent implements OnInit {
  @Input() ticket: Ticket;

  public contract: Contract;
  public transport: Contact;
  public client: Contact;

  pdfLink: string;
  imageTicketList: string[] = [];

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    loop: true
  };
  constructor(
    private modalController: ModalController,
    private storage: AngularFireStorage,
    private db: Firestore
  ) { }

  ngOnInit(): void {
    this.ticket.getPrintDocs(this.db).then(result => {
      let _;
      [_, this.contract, this.transport, this.client] = result;
    })

    this.ticket.getPdfLink(this.storage)
    .then(pdfLink => {
      this.pdfLink = pdfLink;
    })
    .catch(reason => {
      this.pdfLink = "";
      console.error(reason);
    });

    this.ticket.getImageLinks(this.storage).then(links => {
      this.imageTicketList = links;
    });
  }
  
  public closeModal = (): void => {
    this.modalController.dismiss();
  }

}
