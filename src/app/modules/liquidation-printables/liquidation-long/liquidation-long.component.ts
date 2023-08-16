import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract } from '@shared/classes/contract';
import { LiquidationTotals } from '@shared/classes/liquidation';
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

  public date: Date = new Date();
  public language: string;

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
