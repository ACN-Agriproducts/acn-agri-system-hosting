import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { DiscountTable } from '@shared/classes/discount-tables';

@Component({
  selector: 'app-set-discount-table-dialog',
  templateUrl: './set-discount-table-dialog.component.html',
  styleUrls: ['./set-discount-table-dialog.component.scss'],
})
export class SetDiscountTableDialogComponent implements OnInit {
  public table: DiscountTable;
  public standardConfig: boolean = true;
  public editing: boolean;

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  
  constructor() {}

  ngOnInit() {
    this.editing = this.table ? true : false;
    this.table = new DiscountTable();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.table.headers, event.previousIndex, event.currentIndex);
  }

  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    if (value) {
      this.table.headers.push(value);
    }
    event.chipInput!.clear();
  }

  remove(header: string) {
    const index = this.table.headers.indexOf(header);

    if (index >= 0) {
      this.table.headers.splice(index, 1);
    }
  }
}
