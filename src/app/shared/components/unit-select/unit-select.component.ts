import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UNIT_LIST, units } from '@shared/classes/mass';

@Component({
  selector: 'app-unit-select',
  templateUrl: './unit-select.component.html',
  styleUrls: ['./unit-select.component.scss'],
})
export class UnitSelectComponent implements OnInit {
  @Input() displayUnits: Map<string, units>;
  @Input() fieldname: string;
  @Input() isPrice?: boolean;

  readonly UNIT_LIST = UNIT_LIST;

  constructor() { }

  ngOnInit() {}

}
