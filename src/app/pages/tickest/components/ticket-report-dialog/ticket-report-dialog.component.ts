import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore, CollectionReference, QueryDocumentSnapshot, QueryFn } from '@angular/fire/compat/firestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Storage } from '@ionic/storage';
import { Contract } from '@shared/classes/contract';
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
  public generatingReport: boolean = false;
  public reportGenerated: boolean = false;

  public beginDate: Date;
  public endDate: Date;
  public contractId: number;
  public startId: number;
  public endId: number;

  public productTicketLists: any = {};
  public contractList: any = {};
  public transportList: any = {};
  public clientList: any = {};
  public totals: any = {
    products: {
      net: {},
      dryWeight: {}
    },
    inventory: {
      net: {},
      dryWeight: {}
    }
  };

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

  async generateReport(): Promise<void> {
    await this.getReportTickets();
  }

  private getReportTickets(): Promise<void> {
    this.generatingReport = true;

    return this.db.collection<Ticket>(
      Ticket.getCollectionReference(this.db, this.currentCompany, this.data.currentPlant),
      this.getFirebaseQueryFn()).get().toPromise().then(async result => {
        const tempTicketList = {};
        const promises = [];

        result.forEach(ticketSnap => {
          const ticket = ticketSnap.data();

          //Check if product list exists
          if(tempTicketList[ticket.productName] == null) {
            tempTicketList[ticket.productName] = [];
          }

          //add ticket to product list
          tempTicketList[ticket.productName].push(ticket);

          // check if totals lists exist
          if(!this.totals.products.net[ticket.productName]){
            this.totals.products.net[ticket.productName] = 0;
            this.totals.products.dryWeight[ticket.productName] = 0;
          }
          if(!this.totals.inventory.net[ticket.tank]) {
            this.totals.inventory.net[ticket.tank] = 0;
            this.totals.inventory.dryWeight[ticket.tank] = 0;
          }

          // Add to totals lists
          this.totals.products.net[ticket.productName] += ticket.getNet();
          this.totals.products.dryWeight[ticket.productName] += ticket.dryWeight;
          this.totals.inventory.net[ticket.tank] += ticket.getNet();
          this.totals.inventory.dryWeight[ticket.tank] += ticket.dryWeight;

          // Get needed documents (contract, transport, client)
          if(this.contractList[ticket.contractID] == null) {
            this.contractList[ticket.contractID] = ticket.getContract(this.db);

            if(this.clientList[ticket.clientName] == null) {
              this.clientList[ticket.clientName] = this.contractList[ticket.contractID].then((contract: Contract) => {
                return contract.getClient();
              });
            }
          }

          if(this.transportList[ticket.truckerId] == null) {
            this.transportList[ticket.truckerId] = ticket.getTransport(this.db);
          }
        });

        await this.awaitAllObjectValues(this.contractList);
        await this.awaitAllObjectValues(this.clientList);
        await this.awaitAllObjectValues(this.transportList);

        this.productTicketLists = tempTicketList;
        this.generatingReport = false;
        this.reportGenerated = true;
      });
  }

  private async awaitAllObjectValues(object: any): Promise<void> {
    for(let key of Object.keys(object)){
      object[key] = await object[key];
    }
  }

  private getFirebaseQueryFn(): QueryFn {
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

  public validateInputs(): boolean {
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
      return this.startId != null && this.endId != null && this.startId <= this.endId;
    }
  }

  public getReportType(): typeof ReportType {
    return ReportType;
  }

  public getOutputType(): typeof OutputType{
    return OutputType;
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