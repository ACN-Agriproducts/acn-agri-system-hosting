import { Component, createPlatform, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Plant } from '@shared/classes/plant';
import { Ticket } from '@shared/classes/ticket';
import * as Excel from 'exceljs';

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
  selector: 'app-monthly-tickets',
  templateUrl: './monthly-tickets.component.html',
  styleUrls: ['./monthly-tickets.component.scss'],
  providers: [
    {
      provide: MAT_DATE_FORMATS, useValue: MY_FORMATS
    }
  ]
})
export class MonthlyTicketsComponent implements OnInit {
  public plants$: Promise<Plant[]>;
  public selectedPlant: Plant;
  public date: Date;
  public status: 'idle' | 'generating' | 'complete' = 'idle';

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.plants$ = Plant.getPlantList(this.db, this.session.getCompany());
  }

  setMonthAndYear(monthAndYear: Date, datepicker: MatDatepicker<Date>) {
    this.date = monthAndYear;
    datepicker.close();
  }

  async generateDocument(): Promise<void> {
    this.status = 'generating';
    // const tickets = Ticket.getTickets(this.db, this.session.getCompany(), )
  }
}
