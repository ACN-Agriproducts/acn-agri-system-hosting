import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company } from '@shared/classes/company';
import { Contract } from '@shared/classes/contract';
import { UNIT_LIST, units } from '@shared/classes/mass';
import { Ticket } from '@shared/classes/ticket';
import { LiquidationPrintableData } from '../printable-liquidation.component';

const DEFAULT_DISPLAY_UNITS: Map<string, units> = new Map<string, units>([
  ["weight", "mTon"],
  // ["moisture", "mTon"],
  // ["dryWeight", "mTon"],
  // ["damagedGrain", "mTon"],
  // ["adjustedWeight", "mTon"],
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

  public tickets: Ticket[];
  public contract: Contract;
  public companyDoc$: Promise<Company>;
  public logoUrl: string = '';
  public date: Date = new Date();
  public language: string;
  public units = UNIT_LIST;

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

    this.contract = this.data.contract;

    this.data.displayUnits = new Map<string, units>(DEFAULT_DISPLAY_UNITS);
  }

  ngOnDestroy() {
    delete this.date;
  }

}
