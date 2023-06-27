import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DiscountTable } from '@shared/classes/discount-tables';

@Component({
  selector: 'app-discount-table',
  templateUrl: './discount-table.component.html',
  styleUrls: ['./discount-table.component.scss'],
})
export class DiscountTableComponent implements OnInit {
  @Input() table: DiscountTable;

  @Output() setTable: EventEmitter<undefined> = new EventEmitter();
  @Output() saveTable: EventEmitter<boolean> = new EventEmitter();
  @Output() deleteTable: EventEmitter<undefined> = new EventEmitter();
  
  public editing: boolean = false;
  public prevTable: DiscountTable;

  constructor() { }

  ngOnInit() { }

  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.table.data, event.previousIndex, event.currentIndex);
  }

  save(cancelled?: boolean) {
    delete this.prevTable;
    this.editing = false;
    this.saveTable.emit(cancelled);
  }

  edit() {
    this.prevTable = new DiscountTable(this.table);
    this.editing = true;
  }

  cancel() {
    this.table = this.prevTable;
    delete this.prevTable;
    this.editing = false;
  }

  ngOnDestroy() {
    delete this.table;
    delete this.prevTable;
  }
}
