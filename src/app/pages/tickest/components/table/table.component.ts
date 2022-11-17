import { AddPictureComponent } from './../add-picture/add-picture.component';
import { ShowDetailsComponent } from './show-details/show-details.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalTicketComponent } from './../modal-ticket/modal-ticket.component';
import { OptionsTicketComponent } from './../options-ticket/options-ticket.component';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PopoverController, ModalController, IonInfiniteScroll } from '@ionic/angular';
import { Ticket } from '@shared/classes/ticket';
import { Firestore, limit, orderBy, where } from '@angular/fire/firestore';
import { Plant } from '@shared/classes/plant';
import { Pagination } from '@shared/classes/FirebaseDocInterface';
import { SessionInfo } from '@core/services/session-info/session-info.service';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public paginator: Pagination<Ticket>;
  public plantList: Plant[] = [];
  public currentCompany: string;
  public currentPlant: string;
  public inTicket: boolean = true;
  private date: Date;
  public ticketStep = 30;

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

      this.getTickets(new Date());
    });
  }

  public dateChangeFn(date: Date) {
    console.log(date);
    this.getTickets(date)
  }

  async getTickets(date: Date){
    this.infiniteScroll.disabled = false;
    this.date = date;

    let startDate: Date = new Date(date.valueOf());
    let endDate: Date = new Date(date.valueOf());

    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,59);

    const colRef = Ticket.getCollectionReference(this.db, this.currentCompany, this.currentPlant, 
      where("in", "==", this.inTicket),
      where("dateOut", ">=", startDate),
      where("dateOut", "<=", endDate),
      orderBy("dateOut", "desc"));

    if(this.paginator) this.paginator.end();
    this.paginator = new Pagination(colRef, this.ticketStep);
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

  public loadInTickets() {
    if(this.inTicket) {
      return;
    }

    this.inTicket = true;
    this.getTickets(this.date)
  }

  public loadOutTickets() {
    if(!this.inTicket) {
      return;
    }

    this.inTicket = false;
    this.getTickets(this.date)
  }

  ngOnDestroy(): void {
      this.paginator.end();
  }
}
