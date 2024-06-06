import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { ProductInfo } from '@shared/classes/contract';
import { Mass, UNIT_LIST, units } from '@shared/classes/mass';
import { PriceDiscounts, WeightDiscounts } from '@shared/classes/ticket';
import { Product } from '@shared/classes/product';
import { Firestore } from '@angular/fire/firestore';
import { Company } from '@shared/classes/company';
import { LiquidationPrintableData } from '../printable-liquidation.component';

const DEFAULT_DISPLAY_UNITS: Map<string, units> = new Map<string, units>([
  ["weight", "lbs"],
  ["moisture", "CWT"],
  ["dryWeight", "CWT"],
  ["damagedGrain", "CWT"],
  ["adjustedWeight", "lbs"],
  ["price", "bu"],
]);

@Component({
  selector: 'app-liquidation-long',
  templateUrl: './liquidation-long.component.html',
  styleUrls: ['./liquidation-long.component.scss'],
})
export class LiquidationLongComponent implements OnInit {
  @Input() data: LiquidationPrintableData;

  public date: Date = new Date();
  public language: string;
  public companyDoc$: Promise<Company>;
  public logoURL: string = '';

  readonly units = UNIT_LIST;

  constructor(
    private session: SessionInfo,
    private db: Firestore
  ) { }

  ngOnInit() {
    this.language = this.session.getLanguage();

    this.data.displayUnits = new Map<string, units>(DEFAULT_DISPLAY_UNITS);
    
    this.companyDoc$ = this.session.getCompanyObject();
    this.companyDoc$.then(async doc => {
      this.logoURL = await doc.getLogoURL(this.db);
    });
  }

  ngOnDestroy() {
    delete this.date;
  }
}

@Pipe({
  name: 'discounts'
})
export class DiscountsPipe implements PipeTransform {

  transform(discounts: WeightDiscounts | PriceDiscounts, ...args: any): number {
    return discounts.total();
  }

}

@Pipe({
  name: 'weightDiscounts'
})
export class WeightDiscountsPipe implements PipeTransform {

  transform(discounts: WeightDiscounts, product: Product | ProductInfo): Mass {
    return discounts.totalMass(product);
  }

}
