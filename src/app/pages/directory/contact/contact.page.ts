import { Component, OnInit, ViewChild } from '@angular/core';
import { Firestore, limit, orderBy, Query, query, where } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { FirebaseDocInterface, Pagination } from '@shared/classes/FirebaseDocInterface';
import { Ticket } from '@shared/classes/ticket';
import { lastValueFrom, of } from 'rxjs';
import { EditContactDialogComponent } from '../components/edit-contact-dialog/edit-contact-dialog.component';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public contact: Contact;
  public currentCompany: string;
  public currentPlant: string;
  public id: string;
  public ready: boolean = false;
  public primaryContact: {
    email: string;
    isPrimary: boolean;
    name: string;
    phone: string;
  };
  
  public purchaseContracts: Pagination<FirebaseDocInterface>;
  public salesContracts: Pagination<FirebaseDocInterface>;
  public tickets: Pagination<FirebaseDocInterface>;
  
  public contactType: null | string[] = [];
  public contractType: string;
  public initialize: boolean = true;
  public docCount: number = 0;

  private docLimit: number = 20;
  private docStep: number = 20;

  constructor(
    private db: Firestore,
    private route: ActivatedRoute,
    private session: SessionInfo,
    private snack: SnackbarService,
    private navController: NavController,
    private dialog: MatDialog,
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

      this.primaryContact = this.contact.getPrimaryMetaContact();
      this.contactType = this.contact.getType();
      if (this.contactType == null) { throw 'Type not found' }

      if (this.contactType.includes('client')) {
        this.getContracts();
      }
      if (this.contactType.includes('trucker')) {
        this.getTickets();
      }
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });
  }

  public async getContracts(): Promise<void> {
    const constraints = [
      where("clientName", "==", this.contact.name),
      orderBy('date'),
      limit(this.docLimit)
    ];

    this.contractType = 'purchase';

    if (await Contract.getContractCount(this.db, this.currentCompany, true, ...constraints) > 0) {
      console.log("Purchase contracts not empty")

      const contractQuery = query(Contract.getCollectionReference(
        this.db,
        this.currentCompany,
        true
      ), ...constraints);

      this.purchaseContracts = this.setPagination(this.purchaseContracts, contractQuery);
    }

    if (await Contract.getContractCount(this.db, this.currentCompany, false, ...constraints) > 0) {
      console.log("Sales contracts not empty")

      const contractQuery = query(Contract.getCollectionReference(
        this.db,
        this.currentCompany,
        false
      ), ...constraints);

      this.salesContracts = this.setPagination(this.salesContracts, contractQuery);
    }
    console.log(this.purchaseContracts == null, this.salesContracts == null);
  }

  public async getTickets(): Promise<void> {
    const constraints = [
      where("truckerId", "==", this.id),
      orderBy('dateOut'),
      limit(this.docLimit)
    ];

    if (await Ticket.getTicketCount(this.db, this.currentCompany, this.currentPlant, ...constraints) > 0) {
      console.log("Tickets not empty")

      const ticketQuery = query(Ticket.getCollectionReference(
        this.db, 
        this.currentCompany, 
        this.currentPlant
      ), ...constraints);

      this.tickets = this.setPagination(this.tickets, ticketQuery);
    }

    console.log(this.tickets == null);
  }

  public setPagination(pagination: Pagination<FirebaseDocInterface>, colQuery: Query<FirebaseDocInterface>)
  : Pagination<FirebaseDocInterface> {
    if (pagination) pagination.end();
    pagination = new Pagination<FirebaseDocInterface>(colQuery, this.docStep);
    return pagination;
  }

  public openContract(refId: string): void {
    this.navController.navigateForward(`dashboard/contracts/contract-info/${this.contractType}/${refId}`);
  }

  public changeContracts = (event: any): void => {
    this.contractType = event.detail.value;
  }

  // public docCount(isPrimary?: boolean): number {
  //   if (isPrimary == null) {
  //     return this.docCount(true) + this.docCount(false);
  //   }
  //   return (isPrimary ? this.primaryPagination : this.secondaryPagination)?.list.length ?? 0;
  // }

  // public getContractType(): string {
  //   if (this.initialize) {
  //     this.contractType = this.docCount(true) > 0 ? 'purchase' : 'sales';
  //     this.initialize = false;
  //   }
  //   return this.contractType;
  // }

  public standardMetacontact(metacontact: {
    email: string;
    isPrimary: boolean;
    name: string;
    phone: string;
  }) {
    return !metacontact.isPrimary;
  }

  public async edit(): Promise<void> {
    const metacontacts = [];
    this.contact.metacontacts.forEach(metaContact => {
      metacontacts.push({ ...metaContact });
    });
    const contactCopy = { ...this.contact, metacontacts: metacontacts };

    const dialogRef = this.dialog.open(EditContactDialogComponent, {
      autoFocus: false,
      data: contactCopy,
    });
    const newContactData = await lastValueFrom(dialogRef.afterClosed());
    if (newContactData == null) return;

    this.updateContact(newContactData);
  }

  public updateContact(data: Contact): void {
    this.contact.update({
      caat: data.caat,
      city: data.city.toUpperCase(),
      metacontacts: data.metacontacts,
      name: data.name.toUpperCase(),
      state: data.state.toUpperCase(),
      streetAddress: data.streetAddress.toUpperCase(),
      tags: data.tags,
      zipCode: data.zipCode,
    })
    .then(() => {
      this.contact.caat = data.caat;
      this.contact.city = data.city.toUpperCase();
      this.contact.metacontacts = data.metacontacts;
      this.contact.name = data.name.toUpperCase();
      this.contact.state = data.state.toUpperCase();
      this.contact.streetAddress = data.streetAddress.toUpperCase();
      this.contact.tags = data.tags;
      this.contact.zipCode = data.zipCode;

      this.snack.open("Contact successfully updated", "success");
    })
    .catch(error => {
      this.snack.open(error, "error");
    });
  }

  public archive(): void {

  }

  public async infiniteContracts(event: any, currentPagination: Pagination<FirebaseDocInterface>) {
    currentPagination?.getNext(snapshot => {
      event.target.complete();

      if (snapshot.docs.length < this.docStep) {
        this.infiniteScroll.disabled = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.purchaseContracts.end();
    this.salesContracts.end();
    this.tickets.end();
  }
}
