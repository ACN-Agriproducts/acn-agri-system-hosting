import { AddPictureComponent } from './../add-picture/add-picture.component';
import { ShowDetailsComponent } from './show-details/show-details.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalTicketComponent } from './../modal-ticket/modal-ticket.component';
import { OptionsTicketComponent } from './../options-ticket/options-ticket.component';
import { Component, OnInit } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  public ticketList: any[];
  public plantList: string[] = [];
  public currentCompany: string;
  public currentPlant: string;
  public inTicket: boolean = true;
  private date: Date;

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

      this.db.collection(`companies/${this.currentCompany}/plants`).valueChanges({idField: "plantName"}).subscribe(val => {
        this.currentPlant = val[0].plantName
        val.forEach(element => {
          this.plantList.push(element.plantName);
        });

        this.getTickets(new Date());
      })
    })
  }

  public dateChangeFn($event) {
    console.log($event);

    this.getTickets(new Date($event.detail.value))
  }

  async getTickets(date: Date){
    this.date = date;

    let startDate: Date = new Date(date.valueOf());
    let endDate: Date = new Date(date.valueOf());

    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,59);

    this.db.collection(`companies/${this.currentCompany}/plants/${this.currentPlant}/tickets`, ref =>
      ref.where("in", "==", this.inTicket)
      .where("dateOut", ">=", startDate)
      .where("dateOut", "<=", endDate)
      .orderBy("dateOut", "desc")
    ).valueChanges({idField: "docId"}).subscribe(val => {
      this.ticketList = val;
      console.log(this.ticketList);
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
        ticket: ticket
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
    var ticket =  this.ticketList.find(t => t.docId = ticketId);

    const modal = await this.modalController.create({
      component: ModalTicketComponent,
      componentProps: {
        ticketId: ticketId,
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
