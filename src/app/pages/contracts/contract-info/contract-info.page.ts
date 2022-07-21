import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { ContractLiquidationLongComponent } from './components/contract-liquidation-long/contract-liquidation-long.component';
import { TicketsTableComponent } from './components/tickets-table/tickets-table.component';
import { Contract } from "@shared/classes/contract";
import { Ticket } from '@shared/classes/ticket';
import { utils, WorkBook, writeFile } from 'xlsx';

import * as Excel from 'exceljs';
import { ThisReceiver } from '@angular/compiler';

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

  onDownloadLiquidation() {
    const table = this.printableLiquidation.getTable();
    const workBook:WorkBook = utils.table_to_book(table);

    writeFile(workBook, `contract-${this.currentContract.id}-liquidation.xlsx`);
  }

  public onDownloadLiquidationV2 = async () => {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet();

    worksheet.mergeCells('D1:F1');
    worksheet.getCell('D1').value = "Weight (lbs)";
    worksheet.getCell('D1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('G1:H1');
    worksheet.getCell('G1').value = "Moisture";
    worksheet.getCell('G1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('J1:K1');
    worksheet.getCell('J1').value = "Damage";
    worksheet.getCell('J1').alignment = { horizontal: 'center' };

    worksheet.getRow(2).values = [
      "Inbound Date", 
      "Ticket #", 
      "Contract", 
      "Gross", 
      "Tare", 
      "Net", 
      "%", 
      "CWT", 
      "Adjusted Weight", 
      "%", 
      "CWT", 
      "Adjusted Weight", 
      "Price ($/BU)", 
      "Adjusted Price ($/BU)", 
      "Total ($)", 
      "Infested", 
      "Inspection", 
      "Net to Pay ($)"
    ];

    worksheet.columns = [
      { key: 'dateIn',  },
      { key: 'id' },
      { key: 'contractID' },
      // Weight (lbs)
        { key: 'gross' },
        { key: 'tare' },
        { key: 'net' },
      // Moisture
        { key: 'moisture' },
        { key: 'cwtMoisture' },
      { key: 'dryWeight' },
      // Damage
        { key: 'damageWeightPercent' },
        { key: 'cwtDamage' },   // dryWeight - undamagedWeight
      { key: 'undamagedWeight' },
      { key: 'price' },         // ???
      { key: 'adjustedPrice' }, // ???
      { key: 'total' },         // AdjustedWeight / Product.weight * price
      { key: 'infested' },      
      { key: 'inspection' },
      { key: 'netToPay' },      // total - infested - inspection
    ];

    worksheet.columns.forEach(column => {
      const lengths = column.values.map(v => v.toString().length);
      const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
      column.width = maxLength;
    });

    this.ticketList.forEach(ticket => {
      const net = ticket.getNet() * (ticket.in ? 1 : -1);

      const thisRow = worksheet.addRow({
        ...ticket,
        net: net,
        moisture: ticket.moisture,
        cwtMoisture: net - ticket.dryWeight,
      });
    });

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
}
