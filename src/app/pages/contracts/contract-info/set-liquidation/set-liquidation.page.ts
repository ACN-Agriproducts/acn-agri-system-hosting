import { Component, OnInit } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { TranslocoService } from '@ngneat/transloco';
import { Contract } from '@shared/classes/contract';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Liquidation, LiquidationTotals } from '@shared/classes/liquidation';
import { PriceDiscounts, Ticket, TicketWithDiscounts, WeightDiscounts } from '@shared/classes/ticket';
import { SelectedTicketsPipe } from '@shared/pipes/selectedTickets/selected-tickets.pipe';

import * as Excel from 'exceljs';

@Component({
  selector: 'app-set-liquidation',
  templateUrl: './set-liquidation.page.html',
  styleUrls: ['./set-liquidation.page.scss'],
})
export class SetLiquidationPage implements OnInit {
  public contract: Contract;
  public discountTables: DiscountTables;
  public id: string;
  public type: string;
  public ready: boolean = false;
  public liquidation: Liquidation;
  public ticketDiscountList: TicketWithDiscounts[] = [];
  public selectedTickets: TicketWithDiscounts[] = [];
  public totals: LiquidationTotals = new LiquidationTotals();
  public editRefId: string;
  public editTickets: TicketWithDiscounts[];

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private route: ActivatedRoute,
    private selectedTicketsPipe: SelectedTicketsPipe,
    private transloco: TranslocoService,
    private snack: SnackbarService,
    private router: Router,
  ) {
    this.type = this.route.snapshot.paramMap.get('type');
    this.id = this.route.snapshot.paramMap.get('id');
    this.editRefId = this.route.snapshot.paramMap.get('refId');
  }

  ngOnInit() {
    Contract.getDocById(this.db, this.session.getCompany(), this.type, this.id).then(async contract => {
      this.contract = contract;
      this.discountTables = await DiscountTables.getDiscountTables(this.db, this.session.getCompany(), contract.product.id);

      this.ticketDiscountList = (await contract.getTickets()).map(ticket => ({
        data: ticket,
        priceDiscounts: new PriceDiscounts(),
        weightDiscounts: new WeightDiscounts(ticket, this.discountTables),
        includeInReport: false
      }));

      if (this.editRefId) {
        this.liquidation = await contract.getLiquidationByRefId(this.editRefId);
        const ticketRefIds = this.liquidation.ticketRefs.map(ticket => ticket.id);
        this.editTickets = this.ticketDiscountList.filter(ticket => ticketRefIds.includes(ticket.data.ref.id));

        this.editTickets.forEach(ticket => ticket.includeInReport = true);
        this.selectedTicketsChange();
      }
      else {
        this.liquidation = new Liquidation(doc(Liquidation.getCollectionReference(this.db, this.session.getCompany(), this.id)));
      }
  
      this.ready = true;
    });
  }

  ngOnDestroy() {
    delete this.totals;
    delete this.liquidation;
  }

  public selectAllTickets(select: boolean): void {
    this.ticketDiscountList.forEach(ticket => {
      if (ticket.data.status !== "pending" || this.editTickets?.includes(ticket)) ticket.includeInReport = select;
    });
    this.selectedTicketsChange();
  }

  public selectedTicketsChange(): void {
    this.selectedTickets = this.selectedTicketsPipe.transform(this.ticketDiscountList);
    this.totals = new LiquidationTotals(this.selectedTickets, this.contract);
  }

  public async onDownloadLiquidation(): Promise<void> {
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
      { header: this.transloco.translate("contracts.info.CWT"), key: 'moistureCwt' },
      { header: this.transloco.translate("contracts.info.%"), key: 'dryWeightPercent' },
      { header: this.transloco.translate("contracts.info.CWT"), key: 'dryCwt' },
      { header: this.transloco.translate("contracts.info.%"), key: 'damage' },
      { header: this.transloco.translate("contracts.info.CWT"), key: 'damageCwt' },
      { header: this.transloco.translate("contracts.info.Adjusted Weight (lbs)"), key: 'adjustedWeight' },
      { header: this.transloco.translate("contracts.info.Price ($/BU)"), key: 'pricePerBushel', style: { numFmt: '0.0000' } },
      { 
        header: this.transloco.translate("contracts.info.Total ($)"), 
        key: 'total', 
        style: { numFmt: '0.000' },
        hidden: (
          !this.totals.priceDiscounts.infested 
          && !this.totals.priceDiscounts.musty 
          && !this.totals.priceDiscounts.sour 
          && !this.totals.priceDiscounts.weathered 
          && !this.totals.priceDiscounts.inspection
        )
      },
      { 
        header: this.transloco.translate("contracts.info.Infested"), 
        key: 'infested', 
        style: { numFmt: '0.000' }, 
        hidden: !this.totals.priceDiscounts.infested 
      },
      { 
        header: this.transloco.translate("contracts.info.Musty"), 
        key: 'musty', 
        style: { numFmt: '0.000' }, 
        hidden: !this.totals.priceDiscounts.musty 
      },
      { 
        header: this.transloco.translate("contracts.info.Sour"), 
        key: 'sour', 
        style: { numFmt: '0.000' }, 
        hidden: !this.totals.priceDiscounts.sour 
      },
      { 
        header: this.transloco.translate("contracts.info.Weathered"), 
        key: 'weathered', 
        style: { numFmt: '0.000' }, 
        hidden: !this.totals.priceDiscounts.weathered 
      },
      { 
        header: this.transloco.translate("contracts.info.Inspection"), 
        key: 'inspection', 
        style: { numFmt: '0.000' }, 
        hidden: !this.totals.priceDiscounts.inspection 
      },
      { header: this.transloco.translate("contracts.info.Net to Pay ($)"), key: 'netToPay', style: { numFmt: '0.000' } }
    ];

    let rowValues = [];
    rowValues[4] = this.transloco.translate("contracts.info.Weight (lbs)");
    rowValues[7] = this.transloco.translate("contracts.info.Moisture");
    rowValues[9] = this.transloco.translate("contracts.info.Drying");
    rowValues[11] = this.transloco.translate("contracts.info.Damage");
    let firstRow = worksheet.insertRow(1, rowValues);

    // formatting
    worksheet.mergeCells('D1:F1');
    worksheet.mergeCells('G1:H1');
    worksheet.mergeCells('I1:J1');
    worksheet.mergeCells('K1:L1');

    firstRow.alignment = worksheet.getRow(2).alignment = { horizontal: 'center' };
    firstRow.font = worksheet.getRow(2).font = { bold: true };
    worksheet.getRow(2).border = { bottom: { style: 'thick'} };

    // populating worksheet columns
    this.selectedTicketsPipe.transform(this.ticketDiscountList).forEach(ticket => {
      const net = ticket.data.gross.getMassInUnit("lbs") - ticket.data.tare.getMassInUnit("lbs");
      const adjustedWeight = net - ticket.weightDiscounts.total();
      const total = (this.contract.price.getPricePerUnit("lbs", this.contract.quantity) * adjustedWeight);
      
      worksheet.addRow({
        ...ticket.data,
        gross: ticket.data.gross.getMassInUnit("lbs"),
        tare: ticket.data.tare.getMassInUnit("lbs"),
        net: net,
        moisture: ticket.data.moisture,
        moistureCwt: ticket.weightDiscounts.moisture.getMassInUnit("CWT"),
        dryWeightPercent: ticket.data.dryWeightPercent,
        dryCwt: ticket.weightDiscounts.dryWeight.getMassInUnit("CWT"),
        damage: ticket.data.damagedGrain,
        damageCwt: ticket.weightDiscounts.damagedGrain.getMassInUnit("CWT"),
        adjustedWeight: adjustedWeight,
        pricePerBushel: this.contract.price.getPricePerUnit("bu", this.contract.quantity),
        total: total,
        ...ticket.priceDiscounts,
        netToPay: total - ticket.priceDiscounts.total()
      });
    });

    worksheet.columns.forEach(column => {
      const lengths = column.values.map(v => v.toString().length);
      const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
      column.width = maxLength > 20 ? 20 : maxLength < 10 ? 10 : maxLength;
    });

    // adding totals row
    const colNamesArray = [
      'gross',
      'tare',
      'net',
      'moistureCwt',
      'dryCwt',
      'damageCwt',
      'adjustedWeight',
      'total',
      'infested',
      'musty',
      'sour',
      'weathered',
      'inspection',
      'netToPay'
    ];
    this.addColumnTotal(worksheet, colNamesArray);
    this.toDownload(workbook);
  }

  public addColumnTotal(worksheet: Excel.Worksheet, colKeys: string[]): void {
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

  public async toDownload (workbook: Excel.Workbook): Promise<void> {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = `contract-${this.contract.id}-liquidation.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  public async submit() {
    this.liquidation.ticketRefs = this.selectedTickets.map(ticket => ticket.data.ref.withConverter(Ticket.converter));
    this.liquidation.set().then(() => {
      this.snack.open(`Liquidation successfully ${this.editRefId ? "edited" : "created"}`, "success");
      this.router.navigate([`dashboard/contracts/contract-info/${this.type}/${this.id}`]);
    })
    .catch(e => {
      console.error(e);
      this.snack.open(`Error ${this.editRefId ? "editing" : "creating"} liquidation`, "success");
    });
  }
}
