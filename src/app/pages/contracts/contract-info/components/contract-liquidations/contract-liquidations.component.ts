import { Component, Input, OnInit } from '@angular/core';
import { ContractLiquidation } from '@shared/classes/contract-liquidation';

@Component({
  selector: 'app-contract-liquidations',
  templateUrl: './contract-liquidations.component.html',
  styleUrls: ['./contract-liquidations.component.scss'],
})
export class ContractLiquidationsComponent implements OnInit {
  @Input() liquidations: ContractLiquidation[];

  constructor() { }

  ngOnInit() {
    console.log(this.liquidations)
  }

}
