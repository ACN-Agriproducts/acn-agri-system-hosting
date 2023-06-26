import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { DiscountTable } from '@shared/classes/discount-tables';

@Component({
  selector: 'app-discount-table',
  templateUrl: './discount-table.component.html',
  styleUrls: ['./discount-table.component.scss'],
})
export class DiscountTableComponent implements OnInit {
  @Input() table: DiscountTable;
  @Input() saved: boolean;

  @Output() setTable: EventEmitter<any> = new EventEmitter();
  @Output() saveTable: EventEmitter<any> = new EventEmitter();
  @Output() deleteTable: EventEmitter<any> = new EventEmitter();
  
  public editing: boolean = false;
  public saving: boolean = false;
  public cancelled: boolean = false;
  public prevTable: DiscountTable;

  constructor(
    private snack: SnackbarService,
  ) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.saved.previousValue != changes.saved.currentValue) {
      this.saving = false;
      if (!this.cancelled) this.snack.open(`Table Saved`, "success");
      this.cancelled = false;
    }
  }

  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.table.data, event.previousIndex, event.currentIndex);
  }

  save() {
    delete this.prevTable;
    this.editing = false;
    this.saving = true;
    this.saveTable.emit();
  }

  edit() {
    this.prevTable = new DiscountTable(this.table);
    this.editing = true;
  }

  cancel() {
    this.table = this.prevTable;
    this.cancelled = true;
    this.save();
    this.snack.open(`Changes Cancelled`);
  }

  ngOnDestroy() {
    delete this.table;
    delete this.prevTable;
  }
}
