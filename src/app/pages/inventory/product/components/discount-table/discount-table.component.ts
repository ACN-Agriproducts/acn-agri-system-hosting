import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { TranslocoService } from '@ngneat/transloco';
import { DiscountTable } from '@shared/classes/discount-tables';

@Component({
  selector: 'app-discount-table',
  templateUrl: './discount-table.component.html',
  styleUrls: ['./discount-table.component.scss'],
})
export class DiscountTableComponent implements OnInit {
  @Input() table: DiscountTable;

  @Output() setTable: EventEmitter<undefined> = new EventEmitter();
  @Output() saveTable: EventEmitter<undefined> = new EventEmitter();
  @Output() deleteTable: EventEmitter<undefined> = new EventEmitter();
  
  public editing: boolean = false;
  public prevTable: DiscountTable;

  constructor(
    private snack: SnackbarService,
    private transloco: TranslocoService
  ) { }

  ngOnInit() { }

  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.table.data, event.previousIndex, event.currentIndex);
  }

  save() {
    delete this.prevTable;
    this.editing = false;
    this.saveTable.emit();
  }

  edit() {
    this.prevTable = new DiscountTable(this.table);
    this.editing = true;
  }

  cancel() {
    this.revert();
    this.editing = false;
    this.snack.open("Changes canceled");
  }

  reset() {
    this.revert();
    this.edit();
    this.snack.open("Changes reset");
  }

  revert() {
    this.table = this.prevTable;
    delete this.prevTable;
  }

  ngOnDestroy() {
    delete this.table;
    delete this.prevTable;
  }
}
