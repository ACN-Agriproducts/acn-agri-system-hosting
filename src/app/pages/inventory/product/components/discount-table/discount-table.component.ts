import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DiscountTable } from '@shared/classes/discount-tables';

@Component({
  selector: 'app-discount-table',
  templateUrl: './discount-table.component.html',
  styleUrls: ['./discount-table.component.scss'],
})
export class DiscountTableComponent implements OnInit {
  @Input() table: DiscountTable;
  
  public reordering: boolean = false;
  public removing: boolean = false;

  constructor() { }

  ngOnInit() { }

  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.table.data, event.previousIndex, event.currentIndex);
  }
}
