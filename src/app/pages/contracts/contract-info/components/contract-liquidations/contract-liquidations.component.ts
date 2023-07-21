import { Component, Input, OnInit } from '@angular/core';
import { Liquidation } from '@shared/classes/liquidation';

@Component({
  selector: 'app-contract-liquidations',
  templateUrl: './contract-liquidations.component.html',
  styleUrls: ['./contract-liquidations.component.scss'],
})
export class ContractLiquidationsComponent implements OnInit {
  @Input() liquidations: Liquidation[];

  constructor() { }

  ngOnInit() {
    console.log(this.liquidations)
  }

}
