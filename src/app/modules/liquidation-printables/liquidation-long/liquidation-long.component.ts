import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract } from '@shared/classes/contract';
import { LiquidationTotals } from '@shared/classes/liquidation';
import { Mass, UNIT_LIST, units } from '@shared/classes/mass';
import { Price } from '@shared/classes/price';
import { PriceDiscounts, ReportTicket, WeightDiscounts } from '@shared/classes/ticket';


@Component({
  selector: 'app-liquidation-long',
  templateUrl: './liquidation-long.component.html',
  styleUrls: ['./liquidation-long.component.scss'],
})
export class LiquidationLongComponent implements OnInit {
  @Input() contract: Contract;
  @Input() selectedTickets: ReportTicket[];
  @Input() totals: LiquidationTotals;
  @Input() colUnits: Map<string, units>;

  public date: Date = new Date();
  public language: string;
  readonly units = UNIT_LIST;

  // public colUnits: Map<string, units> = new Map<string, units>([
  //   ["weight", "lbs"],
  //   ["moisture", "CWT"],
  //   ["dryWeight", "CWT"],
  //   ["damagedGrain", "CWT"],
  //   ["adjustedWeight", "lbs"],
  //   ["price", "bu"],
  // ]);

  constructor(
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.language = this.session.getLanguage();
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

  transform(discounts: WeightDiscounts): Mass {
    return discounts.totalMass();
  }

}

// @Pipe({
//   name: 'priceDiscounts'
// })
// export class PriceDiscountsPipe implements PipeTransform {

//   transform(discounts: PriceDiscounts, ...args: any): Price {
//     return discounts.total();
//   }

// }
