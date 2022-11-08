import { Component, OnInit, ViewChild } from '@angular/core';
import { CollectionReference, Firestore, limit, orderBy, Query, query, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { FirebaseDocInterface, Pagination } from '@shared/classes/FirebaseDocInterface';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public contact: Contact;
  public contactType: string;
  public contractType: string = 'purchase';
  public currentCompany: string;
  public currentPlant: string;
  // public docList: (Contract | Ticket)[] = [];
  public id: string;
  public isToggled: boolean = false;
  // public purchaseContracts: Contract[] = [];
  public ready: boolean = false;
  // public salesContracts: Contract[] = [];
  public primaryDocPagination: Pagination<FirebaseDocInterface>;
  public secondaryDocPagination: Pagination<FirebaseDocInterface>;
  public docPagination: Pagination<FirebaseDocInterface>;
  public docCount: number = 0;

  private docLimit: number = 20;
  private docStep: number = 20;

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
    const queryList = [
      where("truckerId", "==", this.id),
      orderBy('dateOut'),
      limit(this.docLimit)
    ];
    // this.docList = await Ticket.getTickets(this.db, this.currentCompany, this.currentPlant, ...queryList);

    const colQuery = query(
      Ticket.getCollectionReference(this.db, this.currentCompany, this.currentPlant),
      ...queryList
    );

    this.primaryDocPagination = this.setPagination(this.primaryDocPagination, colQuery);
    this.docPagination = this.primaryDocPagination;
  }

  public async getContracts(): Promise<void> {
    const queryList = [
      where("clientName", "==", this.contact.name),
      orderBy('date'),
      limit(this.docLimit)
    ];

    // [this.purchaseContracts, this.salesContracts] = await Contract.getContracts(this.db, this.currentCompany, ...query);
    // this.docList = this.purchaseContracts;

    // if (this.docList.length === 0) {
    //   this.docList = this.salesContracts;
    //   this.contractType = 'sales';
    // }

    const primaryColQuery = query(
      Contract.getCollectionReference(this.db, this.currentCompany, true),
      ...queryList
    );

    const secondaryColQuery = query(
      Contract.getCollectionReference(this.db, this.currentCompany, false),
      ...queryList
    );

    this.primaryDocPagination = this.setPagination(this.primaryDocPagination, primaryColQuery);
    this.secondaryDocPagination = this.setPagination(this.secondaryDocPagination, secondaryColQuery);

    this.docPagination = this.primaryDocPagination;
  }

  public setPagination(pagination: Pagination<FirebaseDocInterface>, colQuery: Query<FirebaseDocInterface>): Pagination<FirebaseDocInterface> {
    if (pagination) pagination.end();
    pagination = new Pagination<FirebaseDocInterface>(colQuery, this.docStep);
    console.log(pagination.list.length)

    return pagination;
  }

  public openContract(refId: string): void {
    this.navController.navigateForward(`dashboard/contracts/contract-info/${this.contractType}/${refId}`);
  }

  public changeContracts = (event: any): void => {
    this.contractType = event.detail.value;
    // this.docList = this.contractType === 'purchase' ? this.purchaseContracts : this.salesContracts;

    this.docPagination = this.contractType === 'purchase' ? this.primaryDocPagination : this.secondaryDocPagination;
  }

  public async infiniteContracts(event: any) {
    this.docPagination.getNext(snapshot => {
      event.target.complete();

      if(snapshot.docs.length < this.docStep) {
        this.infiniteScroll.disabled = true;
      }
    });
  }

  public edit() {
    // use mat dialog with form fields so that user can edit properties of contact
  }
}
