import { Component, KeyValueDiffers, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractLiquidationLongComponent } from './components/contract-liquidation-long/contract-liquidation-long.component';
import { Contract, LiquidationTotals } from "@shared/classes/contract";
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Ticket, TicketWithDiscounts, WeightDiscounts, PriceDiscounts } from '@shared/classes/ticket';

import * as Excel from 'exceljs';
import { Firestore } from '@angular/fire/firestore';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { SelectedTicketsPipe } from '@shared/pipes/selectedTickets/selected-tickets.pipe';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { TranslocoService } from '@ngneat/transloco';
import { DiscountTables } from '@shared/classes/discount-tables';

@Component({
  selector: 'app-contract-info',
  templateUrl: './contract-info.page.html',
  styleUrls: ['./contract-info.page.scss'],
})
export class ContractInfoPage implements OnInit, OnDestroy {
  @ViewChild(ContractLiquidationLongComponent) printableLiquidation: ContractLiquidationLongComponent;

  public id: string;
  public type: string;
  public currentCompany: string;
  public currentContract: Contract;
  public ready: boolean = false;
  public ticketList: Ticket[];
  public ticketDiscountList: TicketWithDiscounts[];
  public showLiquidation: boolean = false;
  public totals: LiquidationTotals = new LiquidationTotals();
  public selectedTickets: TicketWithDiscounts[] = [];
  public discountTables: DiscountTables;
  
  constructor(
    private route: ActivatedRoute,
    private db: Firestore,
    private fns: Functions,
    private snack: SnackbarService,
    private selectedTicketsPipe: SelectedTicketsPipe,
    private session: SessionInfo,
    ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type');
    this.currentCompany = this.session.getCompany();
    this.differs

    Contract.getDocById(this.db, this.currentCompany, this.type == 'purchase', this.id).then(async contract => {
      this.currentContract = contract;
      this.ticketList = await contract.getTickets();
      this.discountTables = await DiscountTables.getDiscountTables(this.db, this.currentCompany, contract.product.id);
      this.ticketDiscountList = this.ticketList.map(ticket => ({
        data: ticket,
        weightDiscounts: new WeightDiscounts(ticket, this.discountTables),
        priceDiscounts: new PriceDiscounts(),
        includeInReport: false
      }));
      
      this.ready = true;
    });
  }

  ngOnDestroy() {
    delete this.totals;
  }

  ngDoCheck() {

  }

  public onDownloadLiquidation = async () => {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet();

    // initializing columns
    worksheet.columns = [
      { header: this.transloco.translate("contracts.info.Inbound Date"), key: 'dateIn' },
      { header: this.transloco.translate("contracts.info.Ticket #"), key: 'id' },
      { header: this.transloco.translate("contracts.info.Contract"), key: 'contractID' },
      { header: this.transloco.translate("contracts.info.Gross"), key: 'gross' },
      { header: this.transloco.translate("contracts.info.Tare"), key: 'tare' },
      { header: this.transloco.translate("contracts.info.Net"), key: 'net' },
      { header: this.transloco.translate("contracts.info.%"), key: 'moisture' },
      { header: this.transloco.translate("contracts.info.CWT"), key: 'moistureCwt' },                        // net - dryWeight
      { header: this.transloco.translate("contracts.info.Adjusted Weight"), key: 'dryWeight' },
      { header: this.transloco.translate("contracts.info.%"), key: 'damage' },                               // not in the ticket yet
      { header: this.transloco.translate("contracts.info.CWT"), key: 'damageCwt' },                          // damageWeight - undamagedWeight
      { header: this.transloco.translate("contracts.info.Adjusted Weight"), key: 'undamagedWeight' },
      { header: this.transloco.translate("contracts.info.Price ($/BU)"), key: 'pricePerBushel' },            // located in contract
      { header: this.transloco.translate("contracts.info.Adjusted Price ($/BU)"), key: 'adjustedPrice' },    // ???
      { header: this.transloco.translate("contracts.info.Total ($)"), key: 'total' },                        // AdjustedWeight / Product.weight * price
      { header: this.transloco.translate("contracts.info.Infested"), key: 'infested' },      
      { header: this.transloco.translate("contracts.info.Inspection"), key: 'inspection' },
      { header: this.transloco.translate("contracts.info.Net to Pay ($)"), key: 'netToPay' },                // total - infested - inspection
    ];

    let rowValues = [];
    rowValues[4] = "Weight(lbs)";
    rowValues[7] = "Moisture";
    rowValues[10] = "Damage";
    let firstRow = worksheet.insertRow(1, rowValues);

    // formatting
    worksheet.mergeCells('D1:F1');
    worksheet.mergeCells('G1:H1');
    worksheet.mergeCells('J1:K1');

    firstRow.alignment = { horizontal: 'center' };
    firstRow.font = { bold: true };
    worksheet.getRow(2).font = { bold: true };
    worksheet.getRow(2).border = { bottom: { style: 'thick'}};

    worksheet.columns.forEach(column => {
      const lengths = column.values.map(v => v.toString().length);
      const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
      column.width = maxLength;
    });

    // populating worksheet columns
    this.selectedTickets.forEach(ticket => {
      const net = ticket.data.getNet().get() * (ticket.data.in ? 1 : -1);

      const dryWeight = ticket.data.dryWeight;
      const moistureCwt = net - dryWeight.get();

      const undamagedWeight = dryWeight;                // remove later when damage/undamagedWeight is added to tickets (ticket.data.undamagedWeight)
      const damageCwt = dryWeight.get() - undamagedWeight.get();
      
      worksheet.addRow({
        ...ticket.data,
        net: net,
        moisture: ticket.data.moisture,
        moistureCwt: moistureCwt,
        damage: 0,                                      // change later when damage/undamagedWeight is added to tickets
        damageCwt: damageCwt,
        undamagedWeight: undamagedWeight,               // change later when damage/undamagedWeight is added to tickets
        pricePerBushel: this.currentContract.pricePerBushel,
        adjustedPrice: this.currentContract.pricePerBushel,
        total: this.currentContract.pricePerBushel * undamagedWeight.getBushelWeight(this.currentContract.productInfo),
        infested: ticket.priceDiscounts.infested,
        inspection: ticket.priceDiscounts.inspection,
        netToPay: this.currentContract.pricePerBushel * dryWeight.getBushelWeight(this.currentContract.productInfo) - ticket.priceDiscounts.infested - ticket.priceDiscounts.inspection
      });
    });

    // adding totals row
    const colNamesArray = [
      'gross',
      'tare',
      'net',
      'moistureCwt',
      'dryWeight',
      'damageCwt',
      'undamagedWeight',
      'pricePerBushel',
      'adjustedPrice',
      'total',
      'infested',
      'inspection',
      'netToPay'
    ];
    this.addColumnTotal(worksheet, colNamesArray);

    this.toDownload(workbook);
  }

  public addColumnTotal = (worksheet: Excel.Worksheet, colKeys: string[]) => {
    const totalRow = worksheet.addRow(["Totals:"]);
    const row = totalRow.number;

    colKeys.forEach(colKey => {
      const col = String.fromCharCode('A'.charCodeAt(0) + worksheet.getColumn(colKey).number - 1);

      totalRow.getCell(colKey).value = { 
        formula: `SUM(${col}3:${col}${row - 1})`
      } as Excel.CellFormulaValue;
    });
    totalRow.font = { bold: true };
    totalRow.border = { top: { style: 'thick' } };
  }
  
  public toDownload = async (workbook: Excel.Workbook) => {
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

  reloadContractTickets = () => {
    httpsCallable(this.fns, 'contracts-updateTickets')({
      company: this.currentCompany,
      contractId: this.id,
      isPurchase: this.type == "purchase"
    }).then(async () => {
      const contract = await Contract.getDocById(this.db, this.currentCompany, this.type == "purchase", this.id);
      const tickets = await contract.getTickets();
      this.ticketList = tickets;
      
      const ticketsToAdd = tickets.filter(t => !this.ticketDiscountList.some(d => d.data.id == t.id));
      this.ticketDiscountList.push(...ticketsToAdd.map(ticket => ({
        data: ticket,
        weightDiscounts: new WeightDiscounts(ticket, this.discountTables),
        priceDiscounts: new PriceDiscounts(),
        includeInReport: false
      })));
    }).catch(error => {
      this.snack.open(error, "error");
    });
  }

  public selectAllTickets = (selectAll: boolean): void => {
    if ((selectAll && this.selectedTickets.length === this.ticketList.length) || (!selectAll && this.selectedTickets.length === 0)) return;
    this.ticketDiscountList.forEach(ticket => {
      ticket.includeInReport = selectAll ? true : false;
    });
    this.handleSelectChange();
  }

  public handleSelectChange = (): void => {
    this.selectedTickets = this.selectedTicketsPipe.transform(this.ticketDiscountList);
    this.totals = new LiquidationTotals(this.selectedTickets, this.currentContract);
  }
}
