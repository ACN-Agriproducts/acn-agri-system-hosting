import { Component, Input, OnInit } from '@angular/core';
import { Liquidation } from '@shared/classes/liquidation';

@Component({
  selector: 'app-liquidations',
  templateUrl: './liquidations.component.html',
  styleUrls: ['./liquidations.component.scss'],
})
export class LiquidationsComponent implements OnInit {
  @Input() liquidations: Liquidation[];

  constructor() { }

  ngOnInit() {
    console.log(this.liquidations)
  }

}
