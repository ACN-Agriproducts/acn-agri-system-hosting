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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private db: Firestore,
    private storage: Storage,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
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
      const testWorkbook = new Excel.Workbook();
      const ticketSheet = testWorkbook.addWorksheet("IN TICKETS");
      const ticketList = this.ticketList.filter(t => t.in).map(this.ticketYTDFormat);

      const inTicketTable = ticketSheet.addTable({
        name: 'testTable',
        ref: 'A1',
        headerRow: true,
        totalsRow: true,
        style: {
          theme: "TableStyleMedium2",
          showRowStripes: true,
        },
        columns: [
          {name: "IN", totalsRowLabel: "Totals:", filterButton: true},
          {name: "Date", filterButton: true},
          {name: "Ticket", filterButton: true},
          {name: "OrgTicket", filterButton: true},
          {name: "void", filterButton: true},
          {name: "Contract", filterButton: true},
          {name: "Product", filterButton: true},
          {name: "Customer_Name", filterButton: true},
          {name: "Vehicle_Driver", filterButton: true},
          {name: "WT_GROSS", filterButton: true, totalsRowFunction: "sum"},
          {name: "WT_TARE", filterButton: true, totalsRowFunction: "sum"},
          {name: "WT_NET", filterButton: true, totalsRowFunction: "sum"},
          {name: "Shrink", filterButton: true},
          {name: "ShrinkWt", filterButton: true, totalsRowFunction: "sum"},
          {name: "Tons", filterButton: true, totalsRowFunction: "sum"},
          {name: "CCGE CERTIFICATE", filterButton: true},
          
        ],
        rows: []
      });

      const map = new Map<number, {key: string, void: string}>([
        [1, {key: "in", void: "in"}],
        [2, {key: "dateOut", void: "dateOut"}],
        [3, {key: "id", void: "id"}],
        [4, {key: "original_ticket", void: ""}],
        [5, {key: "void", void: "void"}],
        [6, {key: "contractID", void: "contractID"}],
        [7, {key: "productName", void: "productName"}],
        [8, {key: "clientName", void: "voidReason"}],
        [9, {key: "driver", void: "driver"}],
        [10, {key: "gross", void: ""}],
        [11, {key: "tare", void: ""}],
        [12, {key: "net", void: ""}],
        [13, {key: "", void: ""}],
        [14, {key: "dryWeight", void: ""}],
        [15, {key: "mTons", void: ""}],
        [16, {key: "CCGE", void: ""}]
      ]);

      // map.forEach((id, col) => {
      //   inTicketTable.getColumn(col).
      //   outTicketSheet.getColumn(col).key = id;
      // });
      
      console.log(inTicketTable);
      ticketList.forEach((ticket, index) => {
        const row = [];
        map.forEach((val, col) => {
          row.push(ticket[ticket.void ? val.void : val.key] ?? "");
        });

        inTicketTable.addRow(row);

        if (ticket.void) {
          ticketSheet.getRow(index + 2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FADA5E' }
          };
        }
      });
      inTicketTable.commit();

      console.table(ticketList);

      testWorkbook.xlsx.writeBuffer().then((data) => {
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
      });
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
      constraints.push(where('dateOut', '>=', first), where('dateOut', '<=', last), where('in', '==', this.inTicket));
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