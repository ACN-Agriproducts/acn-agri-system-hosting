import { Component, OnInit, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DateAdapter } from '@angular/material/core';
import { DateRange, MatDateRangeSelectionStrategy, MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { StorageLogs } from '@shared/classes/storageLogs';

@Injectable()
export class WeekRangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D): DateRange<D> {
    return this._createWeekRange(date);
  }

  createPreview(activeDate: D): DateRange<D> {
    return this._createWeekRange(activeDate);
  }

  private _createWeekRange(date: D | null): DateRange<D> {
    if(date) {
      const day = this._dateAdapter.getDayOfWeek(date);

      const start = this._dateAdapter.addCalendarDays(date, -day);
      const end = this._dateAdapter.addCalendarDays(date, 6-day);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}

@Component({
  selector: 'app-storage-logs',
  templateUrl: './storage-logs.page.html',
  styleUrls: ['./storage-logs.page.scss'],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: WeekRangeSelectionStrategy
    }
  ]
})
export class StorageLogsPage implements OnInit {
  public storageLogs$: Promise<StorageLogs[]>;
  public lastLogsBefore$: Promise<StorageLogs>;

  public startDate: Date;
  public endDate: Date;

  constructor(
    private session: SessionInfo,
    private db: Firestore
  ) { }

  ngOnInit() {
    this.startDate = new Date();
    this.endDate = new Date();

    const weekday = this.startDate.getDay();
    this.startDate.setDate(this.startDate.getDate() - weekday);
    this.endDate.setDate(this.endDate.getDate() + (6 - weekday));
    this.getLogs();
  }

  setDateTimes() {
    this.startDate.setHours(0,0,0,0);
    this.endDate.setHours(23, 59, 59, 999);
  }

  getLogs() {
    this.setDateTimes();

    this.storageLogs$ = StorageLogs.getStorageLogListDateRange(this.db, this.session.getCompany(), this.session.getPlant(), this.startDate, this.endDate);
    this.lastLogsBefore$ = StorageLogs.getLastStorageLogBeforeDate(this.db, this.session.getCompany(), this.session.getPlant(), this.startDate);
  }
}