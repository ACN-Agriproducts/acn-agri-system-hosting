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

  @Output() tableSet: EventEmitter<any> = new EventEmitter();
  @Output() tableSave: EventEmitter<any> = new EventEmitter();
  @Output() tableDelete: EventEmitter<any> = new EventEmitter();
  
  public editing: boolean = false;
  public saving: boolean = false;
  public prevTable: DiscountTable;

  constructor(
    private snack: SnackbarService,
  ) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.saved.previousValue != changes.saved.currentValue) {
      this.saving = false;
      this.snack.open(`Table Saved`, "success");
    }
  }

  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.table.data, event.previousIndex, event.currentIndex);
  }

  save() {
    delete this.prevTable;
    this.editing = false;
    this.saving = true;
    this.tableSave.emit();
  }

  edit() {
    this.prevTable = new DiscountTable(this.table);
    this.editing = true;
  }

  cancel() {
    this.table = this.prevTable;
    delete this.prevTable;
    this.save();
    this.snack.open(`Changes Cancelled`);
  }

  ngOnDestroy() {
    delete this.table;
    delete this.prevTable;
  }
}
