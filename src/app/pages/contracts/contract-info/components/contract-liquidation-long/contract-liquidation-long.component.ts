import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Contract, LiquidationTotals } from '@shared/classes/contract';
import { PriceDiscounts, TicketWithDiscounts, WeightDiscounts } from '@shared/classes/ticket';


@Component({
  selector: 'app-contract-liquidation-long',
  templateUrl: './contract-liquidation-long.component.html',
  styleUrls: ['./contract-liquidation-long.component.scss'],
})
export class ContractLiquidationLongComponent implements OnInit {
  @Input() contract: Contract;
  @Input() selectedTickets: TicketWithDiscounts[];
  @Input() totals: LiquidationTotals;

  public date: Date = new Date();

  constructor() { }

  ngOnInit() { }

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
