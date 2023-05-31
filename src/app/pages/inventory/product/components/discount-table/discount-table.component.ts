import { Component, Input, OnInit } from '@angular/core';
import { DiscountTable } from '@shared/classes/discount-tables';

@Component({
  selector: 'app-discount-table',
  templateUrl: './discount-table.component.html',
  styleUrls: ['./discount-table.component.scss'],
})
export class DiscountTableComponent implements OnInit {
  @Input() table: DiscountTable;

  constructor() { }

  ngOnInit() {
    console.log(this.table)
  }

}
