import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { TranslocoService } from '@ngneat/transloco';
import { Contract } from '@shared/classes/contract';
import { LiquidationTotals, ReportTicket } from '@shared/classes/liquidation';
import { UNIT_LIST, units } from '@shared/classes/mass';
import { PrintableDialogComponent } from '@shared/components/printable-dialog/printable-dialog.component';

import * as Excel from 'exceljs';

export interface LiquidationDialogData {
  selectedTickets: ReportTicket[];
  contract: Contract;
  totals: LiquidationTotals;
  displayUnits?: Map<string, units>;
}

@Component({
  selector: 'app-liquidation-dialog',
  templateUrl: './liquidation-dialog.component.html',
  styleUrls: ['./liquidation-dialog.component.scss'],
})
export class LiquidationDialogComponent implements OnInit {

  public printableFormats = {
    "Liquidation Long": "liquidation-long",
  };
  public selectedFormat: string = this.printableFormats["Liquidation Long"];

  public displayUnits: Map<string, units> = new Map<string, units>([
    ["weight", "lbs"],
    ["moisture", "CWT"],
    ["dryWeight", "CWT"],
    ["damagedGrain", "CWT"],
    ["adjustedWeight", "lbs"],
    ["price", "bu"],
  ]);

  readonly units = UNIT_LIST;

  constructor(
    public dialogRef: MatDialogRef<PrintableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LiquidationDialogData,
    private transloco: TranslocoService,
    private snack: SnackbarService,
  ) {}

  ngOnInit() {
    this.data.displayUnits = this.displayUnits;
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
      { header: this.displayUnits.get('moisture').toUpperCase(), key: 'moistureWeight', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.%"), key: 'dryWeightPercent' },
      { header: this.displayUnits.get('dryWeight').toUpperCase(), key: 'dryWeight', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.%"), key: 'damage' },
      { header: this.displayUnits.get('damagedGrain').toUpperCase(), key: 'damagedGrain', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.Adjusted Weight") + `(${this.displayUnits.get('adjustedWeight').toUpperCase()})`, key: 'adjustedWeight', style: { numFmt: '0.000' } },
      { header: this.transloco.translate("contracts.info.Price ($/BU)"), key: 'pricePerBushel', style: { numFmt: '0.0000' } },
      { 
        header: this.transloco.translate("contracts.info.Total ($)"), 
        key: 'total', 
        style: { numFmt: '0.000' },
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
        style: { numFmt: '0.000' }, 
        hidden: !this.data.totals.priceDiscounts.infested 
      },
      { 
        header: this.transloco.translate("contracts.info.Musty"), 
        key: 'musty', 
        style: { numFmt: '0.000' }, 
        hidden: !this.data.totals.priceDiscounts.musty 
      },
      { 
        header: this.transloco.translate("contracts.info.Sour"), 
        key: 'sour', 
        style: { numFmt: '0.000' }, 
        hidden: !this.data.totals.priceDiscounts.sour 
      },
      { 
        header: this.transloco.translate("contracts.info.Weathered"), 
        key: 'weathered', 
        style: { numFmt: '0.000' }, 
        hidden: !this.data.totals.priceDiscounts.weathered 
      },
      { 
        header: this.transloco.translate("contracts.info.Inspection"), 
        key: 'inspection', 
        style: { numFmt: '0.000' }, 
        hidden: !this.data.totals.priceDiscounts.inspection 
      },
      { header: this.transloco.translate("contracts.info.Net to Pay ($)"), key: 'netToPay', style: { numFmt: '0.000' } }
    ];

    let rowValues = [];
    rowValues[4] = this.transloco.translate("contracts.info.Weight") + ` (${this.displayUnits.get('weight').toUpperCase()})`;
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
    this.data.selectedTickets.forEach(ticket => {
      const net = ticket.data.gross.getMassInUnit(this.displayUnits.get('weight')) - ticket.data.tare.getMassInUnit(this.displayUnits.get('weight'));
      const adjustedWeight = net - ticket.data.weightDiscounts.totalMass().get();
      const total = (this.data.contract.price.getPricePerUnit(this.displayUnits.get('price'), this.data.contract.quantity) * adjustedWeight);
      
      worksheet.addRow({
        ...ticket.data,
        gross: ticket.data.gross.getMassInUnit(this.displayUnits.get('weight')),
        tare: ticket.data.tare.getMassInUnit(this.displayUnits.get('weight')),
        net: net,
        moisture: ticket.data.moisture,
        moistureWeight: ticket.data.weightDiscounts.moisture?.getMassInUnit(this.displayUnits.get('moisture')) ?? 0,
        dryWeightPercent: ticket.data.dryWeightPercent,
        dryWeight: ticket.data.weightDiscounts.dryWeight?.getMassInUnit(this.displayUnits.get('dryWeight')) ?? 0,
        damage: ticket.data.damagedGrain,
        damagedGrain: ticket.data.weightDiscounts.damagedGrain?.getMassInUnit(this.displayUnits.get('damagedGrain')) ?? 0,
        adjustedWeight: adjustedWeight,
        pricePerBushel: this.data.contract.price.getPricePerUnit(this.displayUnits.get('price'), this.data.contract.quantity),
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

    // adding data.totals row
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
    a.download = `data.contract-${this.data.contract.id}-liquidation.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  public setUnits(units: units): void {
    [...this.displayUnits.keys()].forEach(key => {
      this.displayUnits.set(key, units);
    });
  }

}
