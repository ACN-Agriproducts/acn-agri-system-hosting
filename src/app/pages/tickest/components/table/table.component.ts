import { AddPictureComponent } from './../add-picture/add-picture.component';
import { ShowDetailsComponent } from './show-details/show-details.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalTicketComponent } from './../modal-ticket/modal-ticket.component';
import { OptionsTicketComponent } from './../options-ticket/options-ticket.component';
import { Component, OnInit } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
export interface PeriodicElement {
  ticket: string;
  date: string;
  customer: string;
  moisture: string;
  testsWt: string;
  contract: string;
  product: string;
  gross: string;
  tare: string;
  net: string;
}
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  public ELEMENT_DATA: PeriodicElement[] = [
    {
      date: '16 de Nov del 2019',
      ticket: '5492',
      customer: 'GRANEROS EL BRASIL',
      moisture: '13.4',
      testsWt: '59.5',
      contract: '322',
      product: 'Yellow Corn',
      gross: '142400',
      tare: '45220',
      net: '97180',
    },
    {
      date: '16 de Nov del 2019',
      ticket: '5492',
      customer: 'GRANEROS EL BRASIL',
      moisture: '13.4',
      testsWt: '59.5',
      contract: '322',
      product: 'Yellow Corn',
      gross: '142400',
      tare: '45220',
      net: '97180',
    },
    {
      date: '16 de Nov del 2019',
      ticket: '5492',
      customer: 'GRANEROS EL BRASIL',
      moisture: '13.4',
      testsWt: '59.5',
      contract: '322',
      product: 'Yellow Corn',
      gross: '142400',
      tare: '45220',
      net: '97180',
    },
    {
      date: '16 de Nov del 2019',
      ticket: '5492',
      customer: 'GRANEROS EL BRASIL',
      moisture: '13.4',
      testsWt: '59.5',
      contract: '322',
      product: 'Yellow Corn',
      gross: '142400',
      tare: '45220',
      net: '97180',
    },
    {
      date: '16 de Nov del 2019',
      ticket: '5492',
      customer: 'GRANEROS EL BRASIL',
      moisture: '13.4',
      testsWt: '59.5',
      contract: '322',
      product: 'Yellow Corn',
      gross: '142400',
      tare: '45220',
      net: '97180',
    },

    {
      date: '16 de Nov del 2019',
      ticket: '5492',
      customer: 'GRANEROS EL BRASIL GRANEROS EL BRASIL GRANEROS EL BRASIL',
      moisture: '13.4',
      testsWt: '59.5',
      contract: '322',
      product: 'Yellow Corn',
      gross: '142400',
      tare: '45220',
      net: '97180',
    },

  ];
  constructor(
    private popoverController: PopoverController,
    private dialog: MatDialog,
    private modalController: ModalController
  ) { }

  ngOnInit(): void {
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
