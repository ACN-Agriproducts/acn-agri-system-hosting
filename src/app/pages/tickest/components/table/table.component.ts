import { AddPictureComponent } from './../add-picture/add-picture.component';
import { ShowDetailsComponent } from './show-details/show-details.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalTicketComponent } from './../modal-ticket/modal-ticket.component';
import { OptionsTicketComponent } from './../options-ticket/options-ticket.component';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PopoverController, ModalController, IonInfiniteScroll } from '@ionic/angular';
import { Ticket } from '@shared/classes/ticket';
import { Firestore, limit, onSnapshot, orderBy, where } from '@angular/fire/firestore';
import { Plant } from '@shared/classes/plant';
import { Pagination } from '@shared/classes/FirebaseDocInterface';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { MatDatepicker } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { Observable } from 'rxjs';
const moment = _moment;

declare type sortOptions = 'id' | 'date';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public scaleTickets: Ticket[];
  public paginator: Pagination<Ticket>;
  public plantList: Plant[] = [];
  public currentCompany: string;
  public currentPlant: string;
  public inTicket: boolean = true;
  public date: Date;
  public ticketStep = 30;
  public sort: sortOptions = 'date';

  public idRangeList: number[];
  public ticketRangeUpper: number;

  constructor(
    private popoverController: PopoverController,
    private dialog: MatDialog,
    private modalController: ModalController,
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit(): void {
    this.currentCompany = this.session.getCompany();
    this.currentPlant = this.session.getPlant();

    Plant.getPlantList(this.db, this.currentCompany).then(val => {
      this.plantList = val;
      this.date = new Date();

      this.getTickets();
    });
  }

  async getTickets(){
    onSnapshot(Ticket.getCollectionReference(this.db, this.session.getCompany(), this.session.getPlant(), where('status', '==', 'pending'), where('in', '==', this.inTicket)), next => {
      this.scaleTickets = next.docs.sort((a, b) => a.data().id - b.data().id).map(t => t.data());
    });

    const lastIdPromise = Ticket.getTickets(this.db, this.session.getCompany(), this.session.getPlant(), where('in', '==', this.inTicket), orderBy('id', 'desc'), limit(1));
    const lastId = (await lastIdPromise)[0].id;
    this.ticketRangeUpper = Math.floor(lastId / 100) + 1;
    this.idRangeList = Array(this.ticketRangeUpper).fill(0).map((x, i) => this.ticketRangeUpper - i);

    switch(this.sort) {
      case 'date': {
        this.ticketDateSort();
        break;
      }
      case 'id': {
        this.ticketIdSort();
        break;
      }
    }
  }

  async ticketDateSort() {
    this.infiniteScroll.disabled = false;

    let startDate: Date = new Date(this.date.valueOf());
    let endDate: Date = new Date(this.date.valueOf());

    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,59);

    const colRef = Ticket.getCollectionReference(this.db, this.session.getCompany(), this.session.getPlant(),
      where("in", "==", this.inTicket),
      where("dateOut", ">=", startDate),
      where("dateOut", "<=", endDate),
      orderBy("dateOut", "desc"));

    if(this.paginator) this.paginator.end();
    this.paginator = new Pagination(colRef, this.ticketStep);
  }

  async ticketIdSort() {
    this.infiniteScroll.disabled = true;

    const colRef = Ticket.getCollectionReference(this.db, this.session.getCompany(), this.session.getPlant(), 
      where('in', '==', this.inTicket),
      where('id', '<', this.ticketRangeUpper * 100), 
      where('id', '>=', (this.ticketRangeUpper - 1) * 100), 
      orderBy('id', 'desc'));

    if(this.paginator) this.paginator.end();
    this.paginator = new Pagination(colRef, 1000);
  }

  async infiniteTickets(event):Promise<void> {
    this.paginator.getNext(snapshot => {
      event.target.complete();

      if(snapshot.docs.length < this.ticketStep) {
        this.infiniteScroll.disabled = true;
      }
    });
  }

  open() {
    const dialogRef = this.dialog.open(ModalTicketComponent, {
      autoFocus: false
    });
  }
  async presentPopoverTicket(ev: any, ticket: any) {
    ev.preventDefault();
    const popover = await this.popoverController.create({
      component: OptionsTicketComponent,
      componentProps: {
        ticket: ticket,
      },
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  public openDetails = async (ev) => {
    const modal = await this.modalController.create({
      component: ShowDetailsComponent,
    });
    return await modal.present();
  }
  public openDialog = async (event, ticketId: string) => {
    var ticket =  this.paginator.list.find(t => t.ref.id == ticketId);

    const modal = await this.modalController.create({
      component: ModalTicketComponent,
      componentProps: {
        ticket: ticket
      },
      cssClass: 'modal-dialog-ticket'
    });
    return await modal.present();
  }
  public openAddicture = async () => {
    const modal = await this.modalController.create({
      component: AddPictureComponent,
    });
    return await modal.present();
  }

  setMonthAndYear(normalizedMonthAndYear: _moment.Moment, datepicker: MatDatepicker<_moment.Moment>) {
    const ctrlValue = moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date = ctrlValue.toDate();
    datepicker.close();
    this.ticketDateSort();
  }

  ngOnDestroy(): void {
      this.paginator.end();
  }
}
