import { Component, Input, OnInit } from '@angular/core';
import { Liquidation } from '@shared/classes/liquidation';

@Component({
  selector: 'app-liquidation-table',
  templateUrl: './liquidation-table.component.html',
  styleUrls: ['./liquidation-table.component.scss'],
})
export class LiquidationTableComponent implements OnInit {
  @Input() liquidations: Liquidation[];

  constructor() { }

  ngOnInit() {
    console.log(this.liquidations)
  }

}
