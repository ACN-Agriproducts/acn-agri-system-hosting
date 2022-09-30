import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';
import { utils, WorkBook, writeFile } from 'xlsx';

import * as Excel from 'exceljs';
import { Firestore, QueryConstraint, where } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';

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

  public ticketList: Ticket[];
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

  private workbookYTD: Excel.Workbook;
  private workbookPromise: Promise<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private db: Firestore,
    private storage: Storage,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();

    this.workbookPromise = getDownloadURL(ref(this.storage, `companies/${this.currentCompany}/TICKETS-YTD-REPORT.xlsx`)).then(url => {
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.onload = async (event) => {
        this.workbookYTD = new Excel.Workbook();
        await this.workbookYTD.xlsx.load(xhr.response);
        console.log("book loaded");
      }

      xhr.open('GET', url);
      xhr.send();
    });
  }

  async generateReport(): Promise<void> {
    await this.getReportTickets();
  }

  public async createExcelDoc(): Promise<void>{
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
    else if(this.reportType == ReportType.YTD) {
      await this.workbookPromise;

      this.workbookYTD.eachSheet((worksheet, sheetID) => {
        console.log(worksheet.name);
      })
      

      const inTicketSheet = this.workbookYTD.getWorksheet("IN TICKETS");
      const outTicketSheet = this.workbookYTD.getWorksheet("OUT TICKETS");
      const inTicketList = this.ticketList.filter(t => t.in).map(this.ticketYTDFormat);
      const outTicketList = this.ticketList.filter(t => !t.in).map(this.ticketYTDFormat);

      const map = new Map<number, string>([
        [1, "in"],
        [2, "dateOut"],
        [4, "id"],
        [5, "original_ticket"],
        [6, "void"],
        [7, "contractID"],
        [8, "productName"],
        [9, "clientName"],
        [10, "driver"],
        [11, "gross"],
        [12, "tare"],
        [13, "net"],
        [14, ""],
        [15, "dryWeight"],
        [16, "mTons"],
        [17, "CCGE"]
      ]);

      map.forEach((id, col) => {
        inTicketSheet.getColumn(col).key = id;
        outTicketSheet.getColumn(col).key = id;
      });

      console.table(inTicketList);
      inTicketSheet.insertRows(2, inTicketList, 'o');

      this.workbookYTD.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
  
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.setAttribute("style", "display: none");
        a.href = url;
        a.download = `TICKETS-YTD-REPORT.xlsx`;
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

    return Ticket.getTickets(this.db, this.currentCompany, this.data.currentPlant, ...this.getFirebaseQueryFn()).then(async result => {
        const tempTicketList = {};

        const sorterTicketList = result.sort((a, b) => a.id - b.id);
        this.ticketList = sorterTicketList;

        sorterTicketList.forEach(ticketSnap => {
          if(ticketSnap.void){
            return;
          }

          //Check if product list exists
          if(tempTicketList[ticketSnap.productName] == null) {
            tempTicketList[ticketSnap.productName] = [];
          }

          //add ticket to product list
          tempTicketList[ticketSnap.productName].push(ticketSnap);

          // check if totals lists exist
          if(!this.totals.products.net[ticketSnap.productName]){
            this.totals.products.net[ticketSnap.productName] = 0;
            this.totals.products.dryWeight[ticketSnap.productName] = 0;
          }
          if(!this.totals.inventory.net[ticketSnap.tank]) {
            this.totals.inventory.net[ticketSnap.tank] = 0;
            this.totals.inventory.dryWeight[ticketSnap.tank] = 0;
          }

          // Add to totals lists
          this.totals.products.net[ticketSnap.productName] += ticketSnap.getNet();
          this.totals.products.dryWeight[ticketSnap.productName] += ticketSnap.dryWeight;
          this.totals.inventory.net[ticketSnap.tank] += ticketSnap.getNet();
          this.totals.inventory.dryWeight[ticketSnap.tank] += ticketSnap.dryWeight;

          // Get needed documents (contract, transport, client)
          if(this.contractList[ticketSnap.contractID] == null) {
            this.contractList[ticketSnap.contractID] = ticketSnap.getContract(this.db);

            if(this.clientList[ticketSnap.clientName] == null) {
              this.clientList[ticketSnap.clientName] = this.contractList[ticketSnap.contractID].then((contract: Contract) => {
                return contract.getClient();
              });
            }
          }

          if(this.transportList[ticketSnap.truckerId] == null) {
            this.transportList[ticketSnap.truckerId] = ticketSnap.getTransport(this.db);
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

  private getFirebaseQueryFn(): QueryConstraint[] {
    const constraints: QueryConstraint[] = []

    if(this.reportType == ReportType.DateRange) {
      this.endDate.setHours(23, 59, 59, 999);
      constraints.push(where('dateOut', '>=', this.beginDate), where('dateOut', '<=', this.endDate), where('in', '==', this.inTicket));
    }

    if(this.reportType == ReportType.Contract) {
      constraints.push(where('in', '==', this.inTicket), where('contractID', '==', this.contractId));
    }

    if(this.reportType == ReportType.IdRange) {
      constraints.push(where('in', '==', this.inTicket), where('id', '>=', this.startId), where('id', '<=', this.endId));
    }

    if(this.reportType == ReportType.ProductBalance) {
      constraints.push(where('dateOut', '>=', this.beginDate), where('dateOut', '<=', this.endDate));
    }

    if(this.reportType == ReportType.YTD) {
      const first = new Date(new Date().getFullYear(), 0, 1);
      const last = new Date(new Date().getFullYear(), 11, 31);
      constraints.push(where('dateOut', '>=', first), where('dateOut', '<=', last));
    }

    return constraints;
  }

  public validateInputs(): boolean {
    if(!(this.reportType != null && this.reportOutputType != null && this.inTicket != null )) {
      if(this.reportType != ReportType.ProductBalance && this.reportType != ReportType.YTD && this.inTicket == null) {
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

    if(this.reportType == ReportType.YTD) {
      return this.reportOutputType == OutputType.excel;
    }
  }

  public getReportType(): typeof ReportType {
    return ReportType;
  }

  public getOutputType(): typeof OutputType{
    return OutputType;
  }

  public ticketYTDFormat(ticket: Ticket): any {
    const formattedTicket = ticket.getGenericCopy();

    formattedTicket.in = ticket.in ? "IN" : "OUT";
    formattedTicket.void = ticket.void ? "VOID" : null;
    formattedTicket.net = ticket.gross - ticket.tare;
    formattedTicket.mTons = formattedTicket.net / 2204.62;

    return formattedTicket;
  }
}

enum ReportType {
  DateRange,
  Contract,
  IdRange,
  ProductBalance,
  YTD
}

enum OutputType {
  pdf,
  excel
}