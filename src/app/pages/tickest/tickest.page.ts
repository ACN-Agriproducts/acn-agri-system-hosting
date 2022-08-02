import { FiltersComponent } from './components/filters/filters.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { TicketReportDialogComponent } from './components/ticket-report-dialog/ticket-report-dialog.component';
import { MatDatepicker } from '@angular/material/datepicker';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import * as _moment from 'moment';
import { TableComponent } from './components/table/table.component';

const moment = _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-tickest',
  templateUrl: './tickest.page.html',
  styleUrls: ['./tickest.page.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE,],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class TickestPage implements OnInit {
  public date: _moment.Moment = moment();
  public currentPlant: string = 'progreso';
  @ViewChild(TableComponent) ticketTable: TableComponent;

  constructor(
    public popoverController: PopoverController,
    public dialog: MatDialog,
    private modalController: ModalController,
  ) { }

  ngOnInit() {}

  public openFilter = async () => {
    const modal = await this.modalController.create({
      component: FiltersComponent,
      cssClass: 'modal-filter-ticket',
    });
    return await modal.present();
    // this.bottomSheet.open(FiltersComponent);

  }

  async openTicketReportDialog(): Promise<void> {
    const dialog = await this.dialog.open(TicketReportDialogComponent, {
      width: '350px',
      data: {currentPlant: this.currentPlant}
    });
  }

  setMonthAndYear(normalizedMonthAndYear: _moment.Moment, datepicker: MatDatepicker<_moment.Moment>) {
    const ctrlValue = moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date = ctrlValue;
    datepicker.close();
    this.ticketTable.dateChangeFn(this.date.toDate());
  }
}
