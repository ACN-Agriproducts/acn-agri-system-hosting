import { Component, Input, OnInit } from '@angular/core';
import { UNIT_LIST, units } from '@shared/classes/mass';

@Component({
  selector: 'app-liquidation-long-units',
  templateUrl: './liquidation-long-units.component.html',
  styleUrls: ['./liquidation-long-units.component.scss'],
})
export class LiquidationLongUnitsComponent implements OnInit {
  @Input() columnLabel: string;

  readonly units = UNIT_LIST;
  
  public columnUnitMap: Map<string, units> = new Map<string, units>([
    ["Weight", "lbs"],
    ["Moisture", "CWT"],
    ["Drying", "CWT"],
    ["Damage", "CWT"],
    ["Adjusted Weight", "lbs"],
    ["Price", "bu"],
  ]);

  constructor() { }

  ngOnInit() {}

}
