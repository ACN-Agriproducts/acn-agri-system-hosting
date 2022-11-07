import { Component, OnInit } from '@angular/core';
import { Firestore, limit, orderBy, query, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NavController } from '@ionic/angular';
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
  public contactType: string;
  public contractType: string = 'purchase';
  public currentCompany: string;
  public currentPlant: string;
  public docList: (Contract | Ticket)[] = [];
  public id: string;
  public isToggled: boolean = false;
  public purchaseContracts: Contract[] = [];
  public ready: boolean = false;
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
    this.docList = await Ticket.getTickets(this.db, this.currentCompany, this.currentPlant, ...query);
  }

  public async getContracts(): Promise<void> {
    const query = [where("clientName", "==", this.contact.name), orderBy('date')];
    [this.purchaseContracts, this.salesContracts] = await Contract.getContracts(this.db, this.currentCompany, ...query);
    this.docList = this.purchaseContracts;

    if (this.docList.length === 0) {
      this.docList = this.salesContracts;
      this.contractType = 'sales';
    }

    console.log(this.purchaseContracts, this.salesContracts);
  }

  public openContract(refId: string): void {
    this.navController.navigateForward(`dashboard/contracts/contract-info/${this.contractType}/${refId}`);
  }

  public changeContracts = (event: any): void => {
    this.contractType = event.detail.value;
    this.docList = this.contractType === 'purchase' ? this.purchaseContracts : this.salesContracts;
  }

  public edit() {
    // use mat dialog with form fields so that user can edit properties of contact
  }
}
