import { ModalController } from '@ionic/angular';
import { AfterViewInit, Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Storage } from '@angular/fire/storage';
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
  public contract: Contract;
  public transport: Contact;
  public client: Contact;

  public isInit = false;

  pdfLink: string;
  imageTicketList: string[] = [];

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    loop: true
  };
  constructor(
    private modalController: ModalController,
    private storage: Storage,
    private db: Firestore,
    @Inject(MAT_DIALOG_DATA) public ticket: Ticket
  ) { }

  ngOnInit(): void {
    console.log("on init");
    if(!this.isInit && this.ticket) {
      this.init();
    }
  }

  init(): void {
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
