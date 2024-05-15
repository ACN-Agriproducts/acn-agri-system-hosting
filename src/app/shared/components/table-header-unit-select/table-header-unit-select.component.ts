import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UNIT_LIST, units } from '@shared/classes/mass';

@Component({
  selector: 'app-table-header-unit-select',
  templateUrl: './table-header-unit-select.component.html',
  styleUrls: ['./table-header-unit-select.component.scss'],
})
export class TableHeaderUnitSelectComponent implements OnInit {
  @Input() displayUnits: Map<string, units>;
  @Input() fieldname: string;
  @Input() isPrice?: boolean;

  readonly UNIT_LIST = UNIT_LIST;

  constructor() { }

  ngOnInit() {}

}
