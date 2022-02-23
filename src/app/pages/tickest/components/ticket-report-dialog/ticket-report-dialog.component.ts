import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore, CollectionReference, QueryFn } from '@angular/fire/compat/firestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Storage } from '@ionic/storage';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-ticket-report-dialog',
  templateUrl: './ticket-report-dialog.component.html',
  styleUrls: ['./ticket-report-dialog.component.scss'],
})
export class TicketReportDialogComponent implements OnInit {
  private currentCompany: string;

  public reportType: number;
  public inTicket: boolean;
  public reportOutputType: OutputType;
  public reportGenerated: boolean = false;

  public beginDate: Date;
  public endDate: Date;
  public contractId: number;
  public startId: number;
  public endId: number;

  public ticketList: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private db: AngularFirestore,
    private localStorage: Storage
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany').then(_currentCompany => {
      this.currentCompany = _currentCompany;
    });

  }

  generateReport() {
    this.db.collection(Ticket.getCollectionReference(this.db, this.currentCompany, this.data.currentPlant), this.getFirebaseQueryFn()).get().toPromise().then(result => {
      result.docs.forEach(doc => {
        console.log(doc.data());
      })
    });
  }

  getFirebaseQueryFn(): QueryFn {
    if(this.reportType == ReportType.DateRange) {
      this.endDate.setHours(23, 59, 59, 999);
      return (q: CollectionReference) => q.where('dateOut', '>=', this.beginDate).where('dateOut', '<=', this.endDate).where('in', '==', this.inTicket);
    }

    if(this.reportType == ReportType.Contract) {
      return (q: CollectionReference) => q.where('in', '==', this.inTicket).where('contractID', '==', this.contractId);
    }

    if(this.reportType == ReportType.IdRange) {
      return (q: CollectionReference) => q.where('in', '==', this.inTicket).where('id', '>=', this.startId).where('id', '<=', this.endId);
    }
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