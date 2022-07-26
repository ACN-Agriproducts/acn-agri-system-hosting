import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { ContractLiquidationLongComponent } from './components/contract-liquidation-long/contract-liquidation-long.component';
import { Contract } from "@shared/classes/contract";
import { Ticket } from '@shared/classes/ticket';
import { utils, WorkBook, writeFile } from 'xlsx';

import * as Excel from 'exceljs';

@Component({
  selector: 'app-contract-info',
  templateUrl: './contract-info.page.html',
  styleUrls: ['./contract-info.page.scss'],
})
export class ContractInfoPage implements OnInit, OnDestroy {

  public id: string;
  public type: string;
  public currentCompany: string;
  public currentContract: Contract;
  public ready:boolean = false;
  public ticketList: Ticket[];
  public ticketDiscountList: {data: Ticket, discounts: any}[];
  public ticketsReady: boolean = false;
  public contractRef: AngularFirestoreDocument;
  public showLiquidation: boolean = false;

  private currentSub: Subscription;

  @ViewChild(ContractLiquidationLongComponent) printableLiquidation: ContractLiquidationLongComponent;
  
  constructor(
    private route: ActivatedRoute,
    private localStorage: Storage,
    private db: AngularFirestore,
    ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type')
    this.localStorage.get('currentCompany').then(val => {
      this.currentCompany = val;
      Contract.getDocById(this.db, this.currentCompany, this.type == "purchase", this.id).then(contract => {
        this.currentContract = contract;
        this.ready = true;
        this.currentContract.getTickets().then(tickets => {
          this.ticketList = tickets;
          const list:{data: Ticket, discounts: any}[] = [];

          this.ticketList.forEach(t => {
            list.push({data: t, discounts: {infested: 0, inspection:0}});
          })
          this.ticketDiscountList = list;
        });
      });
    });
  }

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

  public onDownloadLiquidation = async () => {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet();

    worksheet.columns = [
      { header: "Inbound Date", key: 'dateIn' },
      { header: "Ticket #", key: 'id' },
      { header: "Contract", key: 'contractID' },
      // Weight (lbs)
        { header: "Gross", key: 'gross' },
        { header: "Tare", key: 'tare' },
        {  header: "Net", key: 'net' },
      // Moisture
        { header: "%", key: 'moisture' },
        { header: "CWT", key: 'moistureCwt' },                      // net - dryWeight
      { header: "Adjusted Weight", key: 'dryWeight' },
      // Damage
        { header: "%", key: 'damage' },                             // not in the ticket yet
        { header: "CWT", key: 'damageCwt' },                        // damageWeight - undamagedWeight
      { header: "Adjusted Weight", key: 'undamagedWeight' },
      { header: "Price ($/BU)", key: 'pricePerBushel' },            // located in contract
      { header: "Adjusted Price ($/BU)", key: 'adjustedPrice' },    // ???
      { header: "Total ($)", key: 'total' },                        // AdjustedWeight / Product.weight * price
      { header: "Infested", key: 'infested' },      
      { header: "Inspection", key: 'inspection' },
      { header: "Net to Pay ($)", key: 'netToPay' },                // total - infested - inspection
    ];

    let rowValues = [];
    rowValues[4] = "Weight(lbs)";
    rowValues[7] = "Moisture";
    rowValues[10] = "Damage";
    worksheet.insertRow(1, rowValues);

    worksheet.mergeCells('D1:F1');
    worksheet.mergeCells('G1:H1');
    worksheet.mergeCells('J1:K1');
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    worksheet.columns.forEach(column => {
      const lengths = column.values.map(v => v.toString().length);
      const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
      column.width = maxLength;
    });

    this.ticketDiscountList.forEach(ticket => {

      const net = ticket.data.getNet() * (ticket.data.in ? 1 : -1);
      const dryWeight = ticket.data.dryWeight;
      const moistureCwt = net - dryWeight;
      const undamagedWeight = dryWeight;  // remove later when damage/undamagedWeight is added to tickets
      const damageCwt = dryWeight - undamagedWeight;
      
      worksheet.addRow({
        ...ticket.data,
        net: net,
        moisture: ticket.data.moisture,
        moistureCwt: moistureCwt,
        damage: 0,                        // change later when damage/undamagedWeight is added to tickets
        damageCwt: damageCwt,
        undamagedWeight: undamagedWeight, // change later when damage/undamagedWeight is added to tickets
        pricePerBushel: this.currentContract.pricePerBushel,
        adjustedPrice: this.currentContract.pricePerBushel,
        total: this.currentContract.pricePerBushel,
        infested: ticket.discounts.infested,
        inspection: ticket.discounts.inspection,
        netToPay: this.currentContract.pricePerBushel / 56 * ticket.data.dryWeight - ticket.discounts.infested - ticket.discounts.inspection,
      });
    });

    let totalRow = worksheet.addRow(["Totals:"]);
    const colNamesArray = ['gross', 'tare', 'net', 'moistureCwt', 'dryWeight', 'damageCwt', 'undamagedWeight', 'pricePerBushel', 'adjustedPrice', 'total', 'infested', 'inspection', 'netToPay'];

    this.addColumnTotal(worksheet, totalRow, colNamesArray);

    const buffer = await workbook.xlsx.writeBuffer();   
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = `contract-${this.currentContract.id}-liquidation.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  public addColumnTotal = (worksheet: Excel.Worksheet, totalRow: Excel.Row, colKeys: string[]) => {
    const row = totalRow.number;

    colKeys.forEach(colKey => {
      const col = String.fromCharCode('A'.charCodeAt(0) + worksheet.getColumn(colKey).number - 1);

      totalRow.getCell(colKey).value = { formula: `SUM(${col}3:${col}${row - 1})`} as Excel.CellFormulaValue;
    });
  }
}
