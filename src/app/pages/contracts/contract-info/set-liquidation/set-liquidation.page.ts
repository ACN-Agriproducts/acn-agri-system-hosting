import { Component, ElementRef, EventEmitter, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { TranslocoService } from '@ngneat/transloco';
import { Contract } from '@shared/classes/contract';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Liquidation, LiquidationTotals } from '@shared/classes/liquidation';
import { UNIT_LIST, units } from '@shared/classes/mass';
import { PriceDiscounts, ReportTicket, Ticket, WeightDiscounts } from '@shared/classes/ticket';
import { PrintableDialogComponent } from '@shared/components/printable-dialog/printable-dialog.component';
import { SelectedTicketsPipe } from '@shared/pipes/selectedTickets/selected-tickets.pipe';
import { InvoiceDialogComponent } from '@shared/printable/printable-invoice/invoice-dialog/invoice-dialog.component';

import * as Excel from 'exceljs';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-set-liquidation',
  templateUrl: './set-liquidation.page.html',
  styleUrls: ['./set-liquidation.page.scss'],
})
export class SetLiquidationPage implements OnInit {
  @ViewChild('printableDialog') printableDialog: TemplateRef<any>;

  public contract: Contract;
  public discountTables: DiscountTables;
  public id: string;
  public type: string;
  public ready: boolean = false;
  public liquidation: Liquidation;
  public totals: LiquidationTotals = new LiquidationTotals();
  public editingRefId: string;
  public allSelected: boolean = false;

  public editingTickets: ReportTicket[];
  public ticketDiscountList: ReportTicket[] = [];
  public selectedTickets: ReportTicket[] = [];

  public colUnits: Map<string, units> = new Map<string, units>([
    ["weight", "lbs"],
    ["moisture", "CWT"],
    ["dryWeight", "CWT"],
    ["damagedGrain", "CWT"],
    ["adjustedWeight", "lbs"],
    ["price", "bu"],
  ]);

  public printableFormats = {
    "Liquidation Long": "liquidation-long",
  };
  public selectedFormat: string;

  readonly units = UNIT_LIST;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private route: ActivatedRoute,
    private selectedTicketsPipe: SelectedTicketsPipe,
    private transloco: TranslocoService,
    private snack: SnackbarService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.type = this.route.snapshot.paramMap.get('type');
    this.id = this.route.snapshot.paramMap.get('id');
    this.editingRefId = this.route.snapshot.paramMap.get('refId');
  }

  ngOnInit() {
    Contract.getDocById(this.db, this.session.getCompany(), this.type, this.id).then(async contract => {
      this.contract = contract;
      this.discountTables = await DiscountTables.getDiscountTables(this.db, this.session.getCompany(), contract.product.id);

      if ((this.discountTables?.tables.length ?? 0) <= 0) {
        this.snack.open("Warning: No Discount Tables Were Found", "warn");
      }

      this.ticketDiscountList = (await contract.getTickets()).map(ticket => {
        ticket.getWeightDiscounts(this.discountTables);
        ticket.defineBushels(contract.productInfo);
        return {
          data: ticket,
          inReport: false
        }
      });

      if (this.editingRefId) {
        this.liquidation = await contract.getLiquidationByRefId(this.editingRefId);
        const editingTicketIds = this.liquidation.ticketRefs.map(t => t.id);
        this.editingTickets = this.ticketDiscountList.filter(t => t.inReport = editingTicketIds.includes(t.data.ref.id));
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
    this.ticketDiscountList.forEach(t => {
      if (t.data.status !== "pending" || this.editingTickets?.includes(t)) t.inReport = select;
    });
    this.selectedTicketsChange();
  }

  public selectedTicketsChange(): void {
    this.selectedTickets = this.selectedTicketsPipe.transform(this.ticketDiscountList);
    this.totals = new LiquidationTotals(this.selectedTickets, this.contract);
    this.allSelected = this.selectedTickets.length === this.ticketDiscountList.filter(t => t.data.status !== "pending" || this.editingTickets?.includes(t)).length;
  }

  public async onDownloadLiquidation(): Promise<void> {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet();

    // initializing columns
    worksheet.columns = [
      { header: this.transloco.translate("contracts.info.Inbound Date"), key: 'dateIn' },
      { header: this.transloco.translate("contracts.info.Ticket #"), key: 'id' },
      { header: this.transloco.translate("contracts.info.Contract"), key: 'contractID' },
      { header: this.transloco.translate("contracts.info.Gross"), key: 'gross', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.Tare"), key: 'tare', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.Net"), key: 'net', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.%"), key: 'moisture' },
      { header: this.colUnits.get('moisture').toUpperCase(), key: 'moistureWeight', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.%"), key: 'dryWeightPercent' },
      { header: this.colUnits.get('dryWeight').toUpperCase(), key: 'dryWeight', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.%"), key: 'damage' },
      { header: this.colUnits.get('damagedGrain').toUpperCase(), key: 'damagedGrain', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.Adjusted Weight") + `(${this.colUnits.get('adjustedWeight').toUpperCase()})`, key: 'adjustedWeight', style: { numFmt: '0.000' } },
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
    rowValues[4] = this.transloco.translate("contracts.info.Weight") + ` (${this.colUnits.get('weight').toUpperCase()})`;
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
    this.selectedTickets.forEach(ticket => {
      const net = ticket.data.gross.getMassInUnit(this.colUnits.get('weight')) - ticket.data.tare.getMassInUnit(this.colUnits.get('weight'));
      const adjustedWeight = net - ticket.data.weightDiscounts.totalMass().get();
      const total = (this.contract.price.getPricePerUnit(this.colUnits.get('price'), this.contract.quantity) * adjustedWeight);
      
      worksheet.addRow({
        ...ticket.data,
        gross: ticket.data.gross.getMassInUnit(this.colUnits.get('weight')),
        tare: ticket.data.tare.getMassInUnit(this.colUnits.get('weight')),
        net: net,
        moisture: ticket.data.moisture,
        moistureWeight: ticket.data.weightDiscounts.moisture?.getMassInUnit(this.colUnits.get('moisture')) ?? 0,
        dryWeightPercent: ticket.data.dryWeightPercent,
        dryWeight: ticket.data.weightDiscounts.dryWeight?.getMassInUnit(this.colUnits.get('dryWeight')) ?? 0,
        damage: ticket.data.damagedGrain,
        damagedGrain: ticket.data.weightDiscounts.damagedGrain?.getMassInUnit(this.colUnits.get('damagedGrain')) ?? 0,
        adjustedWeight: adjustedWeight,
        pricePerBushel: this.contract.price.getPricePerUnit(this.colUnits.get('price'), this.contract.quantity),
        total: total,
        ...ticket.data.priceDiscounts,
        netToPay: total - ticket.data.priceDiscounts.total()
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
      'moistureWeight',
      'dryWeight',
      'damagedGrain',
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

  private addColumnTotal(worksheet: Excel.Worksheet, colKeys: string[]): void {
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

  private async toDownload (workbook: Excel.Workbook): Promise<void> {
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

  public async submit(): Promise<void> {
    await this.openLiquidation();

    this.liquidation.ticketRefs = this.selectedTickets.map(ticket => ticket.data.ref.withConverter(Ticket.converter));
    this.liquidation.set().then(() => {
      this.ticketDiscountList.forEach(ticket => {
        ticket.data.update({
          weightDiscounts: ticket.data.weightDiscounts.getRawData()
        });
      });
      this.snack.open(`Liquidation successfully ${this.editingRefId ? "edited" : "created"}`, "success");
      this.router.navigate([`dashboard/contracts/contract-info/${this.type}/${this.id}`]);
    })
    .catch(e => {
      console.error(e);
      this.snack.open(`Error ${this.editingRefId ? "editing" : "creating"} liquidation`, "success");
    });
  }

  public async openLiquidation(): Promise<void> {
    const dialog = this.dialog.open(this.printableDialog, {
        panelClass: "borderless-dialog",
        minWidth: "80%",
        maxWidth: "100%",
        height: "75vh"
      }
    );

    return lastValueFrom(dialog.afterClosed());
  }

  public setUnits(units: units): void {
    [...this.colUnits.keys()].forEach(key => {
      this.colUnits.set(key, units);
    });
  }
}
