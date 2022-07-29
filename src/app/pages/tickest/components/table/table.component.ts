import { AddPictureComponent } from './../add-picture/add-picture.component';
import { ShowDetailsComponent } from './show-details/show-details.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalTicketComponent } from './../modal-ticket/modal-ticket.component';
import { OptionsTicketComponent } from './../options-ticket/options-ticket.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PopoverController, ModalController, IonInfiniteScroll } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';
import { Ticket } from '@shared/classes/ticket';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public ticketList: Ticket[];
  public plantList: string[] = [];
  public currentCompany: string;
  public currentPlant: string;
  public inTicket: boolean = true;
  private date: Date;
  private path: string;
  private currentSub: Subscription[] = [];

  private ticketStep: number = 20;
  private ticketLimit: number = 20;

  constructor(
    private popoverController: PopoverController,
    private dialog: MatDialog,
    private modalController: ModalController,
    private db: AngularFirestore,
    private localStorage: Storage,
  ) { }

  ngOnInit(): void {
    this.localStorage.get('currentCompany').then(currentComp => {
      this.currentCompany = currentComp;

      const tempsub = this.db.collection(`companies/${this.currentCompany}/plants`).get().subscribe(val => {
        this.currentPlant = val.docs[0].id;
        val.forEach(element => {
          this.plantList.push(element.id);
        });

        this.path = `companies/${this.currentCompany}/plants/${this.currentPlant}/tickets`;
        this.getTickets(new Date());
        tempsub.unsubscribe();
      });
    })
  }

  public dateChangeFn($event) {
    this.getTickets(new Date($event.detail.value))
  }

  async getTickets(date: Date){
    if(this.currentSub.length > 0) {
      for(const sub of this.currentSub){
        sub.unsubscribe();
      };

      this.currentSub = [];
    }

    this.infiniteScroll.disabled = false;
    this.ticketLimit = this.ticketStep;
    this.date = date;

    let startDate: Date = new Date(date.valueOf());
    let endDate: Date = new Date(date.valueOf());

    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,59);

    const sub = Ticket.getTicketSnapshot(this.db, this.currentCompany, this.currentPlant, ref =>
      ref.where("in", "==", this.inTicket)
      .where("dateOut", ">=", startDate)
      .where("dateOut", "<=", endDate)
      .orderBy("dateOut", "desc")
      .limit(this.ticketLimit))
    .subscribe(ticketList => {
      this.ticketList = ticketList;
    });

    this.currentSub.push(sub);
  }

  async infiniteTickets(event):Promise<void> {
    for(const sub of this.currentSub){
      sub.unsubscribe();
    };
    this.currentSub = [];
    this.ticketLimit += this.ticketStep;

    let startDate: Date = new Date(this.date.valueOf());
    let endDate: Date = new Date(this.date.valueOf());

    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,59);

    const sub = Ticket.getTicketSnapshot(this.db, this.currentCompany, this.currentPlant, ref =>
      ref.where("in", "==", this.inTicket)
      .where("dateOut", ">=", startDate)
      .where("dateOut", "<=", endDate)
      .orderBy("dateOut", "desc")
      .limit(this.ticketLimit))
    .subscribe(ticketList => {
      this.ticketList = ticketList;
    });

    this.currentSub.push(sub);
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
        collectionPath: this.path
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
    var ticket =  this.ticketList.find(t => t.ref.id == ticketId);

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
}
