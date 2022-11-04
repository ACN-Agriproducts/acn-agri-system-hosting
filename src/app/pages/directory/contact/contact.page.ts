import { Component, OnInit } from '@angular/core';
import { Firestore, limit, orderBy, query, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NavController } from '@ionic/angular';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';

declare type ContactDocs = Contract[] | Ticket[];
declare type ContactDoc = Contract | Ticket;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  public contact: Contact;
  public contactType: string;
  public currentCompany: string;
  public currentPlant: string;
  public id: string;
  public isToggled: boolean = false;
  public ready: boolean = false;
  
  // new method
  public docCount: number = 0;
  public ticketList: Ticket[] = [];
  public purchaseContracts: Contract[] = [];
  public salesContracts: Contract[] = [];

  constructor(
    private db: Firestore,
    private route: ActivatedRoute,
    private session: SessionInfo,
    private snack: SnackbarService,
    private navController: NavController,
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
    this.currentPlant = this.session.getPlant();
    this.id = this.route.snapshot.paramMap.get('id');

    Contact.getDoc(this.db, this.currentCompany, this.id)
    .then(async contact => {
      this.contact = contact;
      this.ready = this.contact != null;
      if (!this.ready) throw 'Contact could not be loaded';

      this.contactType = this.contact.type.toLowerCase();
      
      if (this.contactType === 'client') {
        this.getContracts();
      }
      else if (this.contactType === 'trucker') {
        this.getTickets();
      }
      else { throw 'Type not found' }
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });
  }

  public async getTickets(): Promise<void> {
    const query = [where("truckerId", "==", this.id), orderBy('dateOut')];
    this.ticketList = await Ticket.getTickets(this.db, this.currentCompany, this.currentPlant, ...query);
    this.docCount = this.ticketList.length;
  }

  public async getContracts(): Promise<void> {
    const query = [where("clientName", "==", this.contact.name), orderBy('date')];
    [this.purchaseContracts, this.salesContracts] = await Contract.getContracts(this.db, this.currentCompany, ...query);

    this.docCount = this.purchaseContracts.length + this.salesContracts.length;
    if (this.purchaseContracts.length > 0 || this.salesContracts.length > 0) {
      this.isToggled = this.purchaseContracts.length < this.salesContracts.length;
    }
  }

  public openContract(refId: string): void {
    const type = !this.isToggled ? 'purchase' : 'sales';
    this.navController.navigateForward(`dashboard/contracts/contract-info/${type}/${refId}`);
  }

  public edit() {
    // use mat dialog with form fields so that user can edit properties of contact
  }
}
