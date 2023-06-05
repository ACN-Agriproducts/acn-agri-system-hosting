import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DiscountTable } from '@shared/classes/discount-tables';

@Component({
  selector: 'app-discount-table',
  templateUrl: './discount-table.component.html',
  styleUrls: ['./discount-table.component.scss'],
})
export class DiscountTableComponent implements OnInit {
  @Input() table: DiscountTable;
  
  @ViewChild('btn-plus') plusBtn: HTMLElement;
  @ViewChildren('btn-plus') plusBtns: QueryList<HTMLElement>;

  constructor() { }

  ngOnInit() {
    
  }

}
