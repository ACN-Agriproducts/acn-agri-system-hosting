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
    let startDate: Date = new Date(date.valueOf());
    let endDate: Date = new Date(date.valueOf());

    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,59);

    this.db.collection(`companies/${this.currentCompany}/plants/${this.currentPlant}/tickets`, ref =>
      ref.where("dateOut", ">=", startDate)
      .where("dateOut", "<=", endDate)
      .orderBy("dateOut", "desc")
    ).valueChanges().subscribe(val => {
      this.ticketList = val;
      console.log(this.ticketList);
    });
  }

  open() {
    const dialogRef = this.dialog.open(ModalTicketComponent, {
      autoFocus: false
    });
  }
  async presentPopoverTicket(ev: any) {
    ev.preventDefault();
    const popover = await this.popoverController.create({
      component: OptionsTicketComponent,
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
  public openDialog = async (event) => {
    // const dialogRef = this.dialog.open(ModalTicketComponent);
    // dialogRef.afterClosed().subscribe(result => {
    //   console.log(`Dialog result: ${result}`);
    // });
    const modal = await this.modalController.create({
      component: ModalTicketComponent,
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
}
