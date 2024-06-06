import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company } from '@shared/classes/company';
import { UNIT_LIST, units } from '@shared/classes/mass';
import { LiquidationPrintableData } from '../printable-liquidation.component';

import * as Excel from 'exceljs';

const DEFAULT_DISPLAY_UNITS: Map<string, units> = new Map<string, units>([
  ["weight", "mTon"],
  ["price", "bu"],
  ["original_weight", "mTon"]
]);

@Component({
  selector: 'app-sales-liquidation',
  templateUrl: './sales-liquidation.component.html',
  styleUrls: ['./sales-liquidation.component.scss'],
})
export class SalesLiquidationComponent implements OnInit {
  @Input() data: LiquidationPrintableData;

  public companyDoc$: Promise<Company>;
  public logoUrl: string = '';
  public date: Date = new Date();
  public language: string;

  readonly units = UNIT_LIST;

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.language = this.session.getLanguage();
    this.companyDoc$ = this.session.getCompanyObject();

    this.companyDoc$.then(async doc => {
      this.logoUrl = await doc.getLogoURL(this.db);
    });

    this.data.displayUnits = new Map<string, units>(DEFAULT_DISPLAY_UNITS);
  }

  ngOnDestroy() {
    delete this.date;
  }

  createLiquidationExcelSheet(workbook: Excel.Workbook): void {
    
  }

}
