import { Component, OnInit } from '@angular/core';
import { Firestore, limit, orderBy, query, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  public contact: Contact;
  public currentCompany: string;
  public currentPlant: string;
  public docList: Contract[] | Ticket[] = [];
  public id: string;
  public ready: boolean = false;

  constructor(
    private db: Firestore,
    private route: ActivatedRoute,
    private session: SessionInfo,
    private snack: SnackbarService,
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
    this.currentPlant = this.session.getPlant();
    this.id = this.route.snapshot.paramMap.get('id');

    Contact.getDoc(this.db, this.currentCompany, this.id)
    .then(async result => {
      this.contact = result;
      this.ready = true;

      console.log(this.contact);

      const type = this.contact.type.toLowerCase();

      if (type === 'client') {
        console.log("Contracts");
        const query = where("clientName", "==", this.contact.name);
        this.docList = await Contract.getContracts(this.db, this.currentCompany, query);
      }
      else if (type === 'trucker') {
        console.log("Tickets");
        const query = where("truckerId", "==", this.id);
        this.docList = await Ticket.getTickets(this.db, this.currentCompany, this.currentPlant, query);
      }
      console.log(this.docList);
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });
  }

  public edit() {
    // use mat dialog with form fields so that user can edit properties of contact
  }
}
