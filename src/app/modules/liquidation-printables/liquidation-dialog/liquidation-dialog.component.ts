import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TranslocoService } from '@ngneat/transloco';
import { UNIT_LIST, units } from '@shared/classes/mass';
import { PrintableDialogComponent } from '@shared/components/printable-dialog/printable-dialog.component';
import { LiquidationPrintableData, PrintableLiquidationComponent } from '../printable-liquidation.component';

import * as Excel from 'exceljs';
import { ContractSettings } from '@shared/classes/contract-settings';
import { LiquidationTotals } from '@shared/classes/liquidation';

const EXCEL_ACCOUNTING_FORMAT_3 = '_($* #,##0.000_);_($* (#,##0.000);_($* "-"??_);_(@_)';
const EXCEL_ACCOUNTING_FORMAT_4 = '_($* #,##0.0000_);_($* (#,##0.0000);_($* "-"??_);_(@_)';

@Component({
  selector: 'app-liquidation-dialog',
  templateUrl: './liquidation-dialog.component.html',
  styleUrls: ['./liquidation-dialog.component.scss'],
})
export class LiquidationDialogComponent implements OnInit {
  @ViewChild('#printable') printable: PrintableLiquidationComponent;
  readonly units = UNIT_LIST;
  
  public orientation: string = "landscape";
  public selectedFormat: string;
  public liquidationTypes: { [name: string]: string };

  constructor(
    public dialogRef: MatDialogRef<PrintableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LiquidationPrintableData,
    private transloco: TranslocoService,
    private session: SessionInfo,
    private db: Firestore
  ) {}

  ngOnInit() {
    ContractSettings.getDocument(this.db, this.session.getCompany()).then(settings => {
      this.liquidationTypes = settings.liquidationTypes;
      
      if (this.data.contract.type === "sales" || this.data.contract.tags.includes("sale")) {
        this.selectedFormat = this.liquidationTypes['sales liquidation'];
        this.data.totals = new LiquidationTotals(this.data.selectedTickets, this.data.contract, true);

      }
      else if (this.data.contract.type === "purchase" || this.data.contract.tags.includes("purchase")) {
        this.selectedFormat = this.liquidationTypes['liquidation long'];
        this.data.totals = new LiquidationTotals(this.data.selectedTickets, this.data.contract);
      }
    });
  }

  public async onDownloadLiquidation(): Promise<void> {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet();

    let totalRowKeys = [];
    if (this.selectedFormat === "liquidation-long") {
      this.populateLiquidationLongWorksheet(worksheet);
      totalRowKeys = [
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
        'netToPay',
      ];
    }
    else if (this.selectedFormat === "sales-liquidation") {
      this.populateSalesLiquidationWorksheet(worksheet);
      totalRowKeys = [
        'gross',
        'tare',
        'net',
        'netToPay',
        'original_weight'
      ];
    }

    // format columns
    worksheet.columns.forEach(column => {
      const lengths = column.values.map(v => v.toString().length);
      const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
      column.width = maxLength > 20 ? 20 : maxLength < 10 ? 10 : maxLength;
    });

    this.addColumnTotal(worksheet, totalRowKeys);
    this.toDownload(workbook);
  }

  private addColumnTotal(worksheet: Excel.Worksheet, colKeys: string[]): void {
    const totalRow = worksheet.addRow(["Totals:"]);
    const row = totalRow.number;

    colKeys.forEach(colKey => {
      const col = String.fromCharCode('A'.charCodeAt(0) + worksheet.getColumn(colKey)?.number - 1);

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
    a.download = `data.contract-${this.data.contract.id}-liquidation.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  public setUnits(units: units): void {
    [...this.data.displayUnits.keys()].forEach(key => {
      this.data.displayUnits.set(key, units);
    });
  }

  public populateLiquidationLongWorksheet(worksheet: Excel.Worksheet): void {
    // initializing columns
    worksheet.columns = [
      { header: this.transloco.translate("contracts.info.Inbound Date"), key: 'dateIn' },
      { header: this.transloco.translate("contracts.info.Ticket #"), key: 'id' },
      { header: this.transloco.translate("contracts.info.Gross"), key: 'gross', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.Tare"), key: 'tare', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.Net"), key: 'net', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.%"), key: 'moisture' },
      { header: this.data.displayUnits.get('moisture').toUpperCase(), key: 'moistureWeight', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.%"), key: 'dryWeightPercent' },
      { header: this.data.displayUnits.get('dryWeight').toUpperCase(), key: 'dryWeight', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.%"), key: 'damage' },
      { header: this.data.displayUnits.get('damagedGrain').toUpperCase(), key: 'damagedGrain', style: { numFmt: '0.000' } },
      { header: `${this.transloco.translate("contracts.info.Adjusted Weight")} (${this.data.displayUnits.get('adjustedWeight').toUpperCase()})`, key: 'adjustedWeight', style: { numFmt: '0.000' } },
      { header: `${this.transloco.translate("contracts.info.Price")} ($/${this.data.displayUnits.get('price').toUpperCase()})`, key: 'price', style: { numFmt: EXCEL_ACCOUNTING_FORMAT_4 } },
      { 
        header: this.transloco.translate("contracts.info.Total ($)"), 
        key: 'total', 
        style: { numFmt: EXCEL_ACCOUNTING_FORMAT_3 },
        hidden: (
          !this.data.totals.priceDiscounts.infested 
          && !this.data.totals.priceDiscounts.musty 
          && !this.data.totals.priceDiscounts.sour 
          && !this.data.totals.priceDiscounts.weathered 
          && !this.data.totals.priceDiscounts.inspection
        )
      },
      { 
        header: this.transloco.translate("contracts.info.Infested"), 
        key: 'infested', 
        style: { numFmt: EXCEL_ACCOUNTING_FORMAT_3 }, 
        hidden: !this.data.totals.priceDiscounts.infested 
      },
      { 
        header: this.transloco.translate("contracts.info.Musty"), 
        key: 'musty', 
        style: { numFmt: EXCEL_ACCOUNTING_FORMAT_3 }, 
        hidden: !this.data.totals.priceDiscounts.musty 
      },
      { 
        header: this.transloco.translate("contracts.info.Sour"), 
        key: 'sour', 
        style: { numFmt: EXCEL_ACCOUNTING_FORMAT_3 }, 
        hidden: !this.data.totals.priceDiscounts.sour 
      },
      { 
        header: this.transloco.translate("contracts.info.Weathered"), 
        key: 'weathered', 
        style: { numFmt: EXCEL_ACCOUNTING_FORMAT_3 }, 
        hidden: !this.data.totals.priceDiscounts.weathered 
      },
      { 
        header: this.transloco.translate("contracts.info.Inspection"), 
        key: 'inspection', 
        style: { numFmt: EXCEL_ACCOUNTING_FORMAT_3 }, 
        hidden: !this.data.totals.priceDiscounts.inspection 
      },
      { header: this.transloco.translate("contracts.info.Net to Pay ($)"), key: 'netToPay', style: { numFmt: EXCEL_ACCOUNTING_FORMAT_3 } }
    ];

    let rowValues = [];
    rowValues[4] = this.transloco.translate("contracts.info.Weight") + ` (${this.data.displayUnits.get('weight').toUpperCase()})`;
    rowValues[7] = this.transloco.translate("contracts.info.Moisture");
    rowValues[9] = this.transloco.translate("contracts.info.Drying");
    rowValues[11] = this.transloco.translate("contracts.info.Damage");
    let firstRow = worksheet.insertRow(1, rowValues);

    // formatting headers
    worksheet.mergeCells('D1:F1');
    worksheet.mergeCells('G1:H1');
    worksheet.mergeCells('I1:J1');
    worksheet.mergeCells('K1:L1');

    firstRow.alignment = worksheet.getRow(2).alignment = { horizontal: 'center' };
    firstRow.font = worksheet.getRow(2).font = { bold: true };
    worksheet.getRow(2).border = { bottom: { style: 'thick'} };

    // populating worksheet columns
    this.data.selectedTickets.forEach(ticket => {
      const net = ticket.net.getMassInUnit(this.data.displayUnits.get('weight'));
      const adjustedWeight = net - ticket.weightDiscounts.totalMass(this.data.contract.productInfo).getMassInUnit(this.data.displayUnits.get('weight'));
      // const total = (this.data.contract.price.getPricePerUnit(this.data.displayUnits.get('price'), this.data.contract.quantity) * adjustedWeight);
      
      worksheet.addRow({
        ...ticket,
        gross: ticket.gross.getMassInUnit(this.data.displayUnits.get('weight')),
        tare: ticket.tare.getMassInUnit(this.data.displayUnits.get('weight')),
        net,
        moisture: ticket.moisture,
        moistureWeight: ticket.weightDiscounts.moisture?.getMassInUnit(this.data.displayUnits.get('moisture')) ?? 0,
        dryWeightPercent: ticket.dryWeightPercent,
        dryWeight: ticket.weightDiscounts.dryWeight?.getMassInUnit(this.data.displayUnits.get('dryWeight')) ?? 0,
        damage: ticket.damagedGrain,
        damagedGrain: ticket.weightDiscounts.damagedGrain?.getMassInUnit(this.data.displayUnits.get('damagedGrain')) ?? 0,
        adjustedWeight: adjustedWeight,
        price: (ticket.price ?? this.data.contract.price).getPricePerUnit(this.data.displayUnits.get('price'), this.data.contract.quantity) ?? 0,
        total: ticket.beforeDiscounts,
        ...ticket.priceDiscounts,
        netToPay: ticket.beforeDiscounts - ticket.priceDiscounts.total()
      });
    });
  }

  public populateSalesLiquidationWorksheet(worksheet: Excel.Worksheet) {
    worksheet.columns = [
      { header: this.transloco.translate("contracts.info.Date"), key: "dateOut" },
      { header: this.transloco.translate("contracts.info.Ticket #"), key: "id" },
      { header: this.transloco.translate("contracts.info.Gross"), key: 'gross', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.Tare"), key: 'tare', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.Net"), key: 'net', style: { numFmt: '0.000' } },
      { header: `${this.transloco.translate("contracts.info.Moisture")} %`, key: 'moisture' },
      { header: this.transloco.translate("contracts.info.Client Weight"), key:'original_weight', style: { numFmt: '0.000' } },
      { header: `${this.transloco.translate("contracts.info.Price")} ($/${this.data.displayUnits.get('price').toUpperCase()})`, key: 'price', style: { numFmt: EXCEL_ACCOUNTING_FORMAT_4 } },
      { header: this.transloco.translate("contracts.info.Net to Pay ($)"), key: 'netToPay', style: { numFmt: EXCEL_ACCOUNTING_FORMAT_3 } }
    ];

    // insert merged headers
    const mergeRowValues = [];
    mergeRowValues[3] = `${this.transloco.translate("contracts.info.Weight")} (${this.data.displayUnits.get('weight').toUpperCase()})`;

    const firstRow = worksheet.insertRow(1, mergeRowValues);
    worksheet.mergeCells('C1:E1');
    
    // format headers
    firstRow.alignment = worksheet.getRow(2).alignment = { horizontal: 'center' };
    firstRow.font = worksheet.getRow(2).font = { bold: true };
    worksheet.getRow(2).border = { bottom: { style: 'thick'} };

    // populating worksheet columns
    this.data.selectedTickets.forEach(ticket => {
      const net = ticket.gross.getMassInUnit(this.data.displayUnits.get('weight')) - ticket.tare.getMassInUnit(this.data.displayUnits.get('weight'));
      
      worksheet.addRow({
        ...ticket,
        gross: ticket.gross.getMassInUnit(this.data.displayUnits.get('weight')),
        tare: ticket.tare.getMassInUnit(this.data.displayUnits.get('weight')),
        net: ticket.net.getMassInUnit(this.data.displayUnits.get('weight')),
        moisture: ticket.moisture,
        original_weight: ticket.original_weight.getMassInUnit(this.data.displayUnits.get('original_weight')),
        price: (ticket.price ?? this.data.contract.price).getPricePerUnit(this.data.displayUnits.get('price'), this.data.contract.quantity) ?? 0,
        netToPay: ticket.netToPay
      });
    });
  }

}
