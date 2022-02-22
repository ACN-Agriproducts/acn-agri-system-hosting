import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ticket-report-dialog',
  templateUrl: './ticket-report-dialog.component.html',
  styleUrls: ['./ticket-report-dialog.component.scss'],
})
export class TicketReportDialogComponent implements OnInit {
  public reportType: number;
  public inTicket: boolean;
  public reportOutputType: OutputType;
  public reportGenerated: boolean = false;

  public beginDate: Date;
  public endDate: Date;

  public contractId: number;

  public startId: number;
  public endId: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {}

  generateReport() {
    this.reportGenerated = true;
  }

  validateInputs(): boolean {
    if(!(this.reportType != null && this.inTicket != null && this.reportOutputType != null)) {
      return false;
    }

    if(this.reportType == ReportType.DateRange) {
      return this.beginDate != null && this.endDate != null;
    }

    if(this.reportType == ReportType.Contract) {
      return this.contractId != null;
    }

    if(this.reportType == ReportType.IdRange) {
      return this.startId != null && this.endId != null && this.startId < this.endId;
    }
  }
}

enum ReportType {
  DateRange,
  Contract,
  IdRange
}

enum OutputType {
  pdf,
  excel
}