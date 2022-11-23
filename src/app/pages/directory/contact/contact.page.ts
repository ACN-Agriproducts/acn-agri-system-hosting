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
  public contactType: string;
  public contractType: string;
  public currentCompany: string;
  public currentPlant: string;
  public primaryPagination: Pagination<FirebaseDocInterface>;
  public secondaryPagination: Pagination<FirebaseDocInterface>;
  public id: string;
  public ready: boolean = false;
  public initialize: boolean = true;

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
      
      if (this.contact.tags.includes('client')) {
        this.contactType = 'client';
        // console.log("getting contracts")
        this.getContracts();
      }
      else if (this.contact.tags.includes('trucker')) {
        this.contactType = 'trucker';
        // console.log("getting tickets")
        this.getTickets();
      }
      else { throw 'Type not found' }
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });
  }

  public getTickets(): void {
    const queryList = [
      where("truckerId", "==", this.id),
      orderBy('dateOut'),
      limit(this.docLimit)
    ];

    this.primaryPagination = this.setPagination(this.primaryPagination, query(
      Ticket.getCollectionReference(this.db, this.currentCompany, this.currentPlant),
      ...queryList
    ));

    // console.log("finished getting tickets")
  }

  public getContracts(): void {
    const queryList = [
      where("clientName", "==", this.contact.name),
      orderBy('date'),
      limit(this.docLimit)
    ];

    this.primaryPagination = this.setPagination(this.primaryPagination, query(
      Contract.getCollectionReference(this.db, this.currentCompany, true),
      ...queryList
    ));

    this.secondaryPagination = this.setPagination(this.secondaryPagination, query(
      Contract.getCollectionReference(this.db, this.currentCompany, false),
      ...queryList
    ));

    // console.log("finished getting contracts")
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

  public async infiniteContracts(event: any) {
    const currentPagination = this.contractType === 'purchase' ? this.primaryPagination : this.secondaryPagination;
    currentPagination?.getNext(snapshot => {
      event.target.complete();

      if(snapshot.docs.length < this.docStep) {
        this.infiniteScroll.disabled = true;
      }
    });
  }

  public docCount(isPrimary?: boolean): number {
    if (isPrimary == null) {
      return this.docCount(true) + this.docCount(false);
    }
    return (isPrimary ? this.primaryPagination : this.secondaryPagination)?.list.length ?? 0;
  }

  public getContractType(): string {
    if (this.initialize) {
      this.contractType = this.docCount(true) > 0 ? 'purchase' : 'sales';
      this.initialize = false;
    }
    return this.contractType;
  }

  public async edit(): Promise<void> {
    const metaContacts = [];
    this.contact.metaContacts.forEach(metaContact => {
      metaContacts.push({ ...metaContact });
    });
    const contactCopy = { ...this.contact, metaContacts: metaContacts };

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
      metaContacts: data.metaContacts,
      name: data.name.toUpperCase(),
      state: data.state.toUpperCase(),
      streetAddress: data.streetAddress.toUpperCase(),
      tags: data.tags,
      zipCode: data.zipCode,
    })
    .then(() => {
      this.contact.caat = data.caat;
      this.contact.city = data.city.toUpperCase();
      this.contact.metaContacts = data.metaContacts;
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

  ngOnDestroy(): void {
    this.primaryPagination?.end();
    this.secondaryPagination?.end();
  }
}
