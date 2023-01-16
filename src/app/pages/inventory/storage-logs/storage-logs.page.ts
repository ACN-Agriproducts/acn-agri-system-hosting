import { Component, OnInit, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { DateAdapter } from '@angular/material/core';
import { DateRange, MatDateRangeSelectionStrategy, MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { SessionInfo } from '@core/services/session-info/session-info.service';

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

  constructor(
    private session: SessionInfo,
    private db: Firestore
  ) { }

  ngOnInit() {

  }

}