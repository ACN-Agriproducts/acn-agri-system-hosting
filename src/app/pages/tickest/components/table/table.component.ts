import { MatDialog } from '@angular/material/dialog';
import { ModalTicketComponent } from './../modal-ticket/modal-ticket.component';
import { OptionsTicketComponent } from './../options-ticket/options-ticket.component';
import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
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
    public popoverController: PopoverController,
    public dialog: MatDialog,
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
 
}
