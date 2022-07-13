import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore, CollectionReference, QueryDocumentSnapshot, QueryFn } from '@angular/fire/compat/firestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Storage } from '@ionic/storage';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';
import { utils, WorkBook, writeFile } from 'xlsx';

import * as Excel from 'exceljs';

@Component({
  selector: 'app-ticket-report-dialog',
  templateUrl: './ticket-report-dialog.component.html',
  styleUrls: ['./ticket-report-dialog.component.scss'],
})
export class TicketReportDialogComponent implements OnInit {
  private currentCompany: string;

  public reportType: ReportType;
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

  public createExcelDoc(): void{
    if(this.reportType == ReportType.ProductBalance) {
      const workbook = new Excel.Workbook();

      for(let product in this.productTicketLists) {
        const workSheet = workbook.addWorksheet(product);
        workSheet.columns = [
          {header: "Date", key: "dateOut"},
          {header: "ID", key: "id"},
          {header: "Client", key: "clientName"},
          {header: "Contract", key: "contractID"},
          {header: "Net", key: "net"},
          {header: "Dry Weight", key: "dryWeight"},
          {header: "Runnnig Total", key: "total"},
        ]

        const list = this.productTicketLists[product] as Ticket[];
        for(let tIndex = 0; tIndex < list.length; tIndex++){
          const ticket = this.productTicketLists[product][tIndex] as Ticket;
          const thisRow = workSheet.addRow({...ticket, net: ticket.getNet() * (ticket.in? 1 : -1)});
          thisRow.getCell('dryWeight').value = ticket.dryWeight * (ticket.in? 1 : -1);

          if(tIndex == 0) {
            thisRow.getCell('total').value = {
              formula: 'F2',
              sharedFormula: 'shared',
            } as Excel.CellSharedFormulaValue;
          }

          if(tIndex == 1) {
            thisRow.getCell('total').value = {
              formula: 'F3 + G2',
              sharedFormula: 'shared',
            } as Excel.CellSharedFormulaValue;
          }

          if(tIndex > 1) {
            thisRow.getCell('total').value = {
              sharedFormula: 'G3'
            } as Excel.CellSharedFormulaValue;
          }
        }
      }

      workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
  
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.setAttribute("style", "display: none");
        a.href = url;
        a.download = `ProductBalances-${this.beginDate.toDateString()}-${this.endDate.toDateString()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      })
    }
    else {
      const tableCollection = document.getElementsByClassName('ticket-report-table');
      const workBook: WorkBook = utils.book_new();

      for(let i = 0; i < tableCollection.length; i++) {
        const table = tableCollection[i];
        const workSheet = utils.table_to_sheet(table);
        utils.book_append_sheet(workBook, workSheet, table.id);
      }

      writeFile(workBook, 'ticket-report.xlsx')
    }
  }

  private getReportTickets(): Promise<void> {
    this.generatingReport = true;

    return this.db.collection<Ticket>(
      Ticket.getCollectionReference(this.db, this.currentCompany, this.data.currentPlant),
      this.getFirebaseQueryFn()).get().toPromise().then(async result => {
        const tempTicketList = {};

        const sorterTicketList = result.docs.sort((a, b) => a.data().dateOut.getTime() - b.data().dateOut.getTime());

        sorterTicketList.forEach(ticketSnap => {
          const ticket = ticketSnap.data();

          if(ticket.void){
            return;
          }

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

    if(this.reportType == ReportType.ProductBalance) {
      return (q: CollectionReference) => q.where('dateOut', '>=', this.beginDate).where('dateOut', '<=', this.endDate);
    }
  }

  public validateInputs(): boolean {
    if(!(this.reportType != null && this.reportOutputType != null && this.inTicket != null )) {
      if(this.reportType != ReportType.ProductBalance && this.inTicket == null) {
        return false;
      }
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

    if(this.reportType == ReportType.ProductBalance) {
      return this.beginDate != null && this.endDate !=null && this.reportOutputType == OutputType.excel;
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
  IdRange,
  ProductBalance
}

enum OutputType {
  pdf,
  excel
}