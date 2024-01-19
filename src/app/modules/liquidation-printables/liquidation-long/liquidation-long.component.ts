import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract, ProductInfo } from '@shared/classes/contract';
import { DEFAULT_DISPLAY_UNITS, LiquidationTotals, ReportTicket } from '@shared/classes/liquidation';
import { Mass, UNIT_LIST, units } from '@shared/classes/mass';
import { Price } from '@shared/classes/price';
import { PriceDiscounts, WeightDiscounts } from '@shared/classes/ticket';
import { LiquidationPrintableData } from '../liquidation-dialog/liquidation-dialog.component';
import { Product } from '@shared/classes/product';


@Component({
  selector: 'app-liquidation-long',
  templateUrl: './liquidation-long.component.html',
  styleUrls: ['./liquidation-long.component.scss'],
})
export class LiquidationLongComponent implements OnInit {
  @Input() data: LiquidationPrintableData;

  public date: Date = new Date();
  public language: string;

  readonly units = UNIT_LIST;

  constructor(
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.language = this.session.getLanguage();
    this.data.displayUnits ??= new Map<string, units>(DEFAULT_DISPLAY_UNITS);
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
