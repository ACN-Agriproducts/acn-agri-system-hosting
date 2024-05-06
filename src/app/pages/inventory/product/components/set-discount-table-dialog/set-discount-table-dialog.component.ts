import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { TitleCasePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { DiscountTable } from '@shared/classes/discount-tables';
import { WEIGHT_DISCOUNT_FIELDS } from '@shared/classes/ticket';

@Component({
  selector: 'app-set-discount-table-dialog',
  templateUrl: './set-discount-table-dialog.component.html',
  styleUrls: ['./set-discount-table-dialog.component.scss'],
  providers: [TitleCasePipe]
})
export class SetDiscountTableDialogComponent implements OnInit {
  public table: DiscountTable;
  public standardConfig: boolean = true;
  public editing: boolean;

  public min: number;
  public max: number;
  public step: number;
  public discountStart: number;
  public discountStep: number;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly discountFieldsList = WEIGHT_DISCOUNT_FIELDS;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DiscountTable,
    public dialogRef: MatDialogRef<SetDiscountTableDialogComponent>,
    private titleCasePipe: TitleCasePipe,
  ) {}

  ngOnInit() {
    this.editing = this.data ? true : false;
    this.table = new DiscountTable(this.data);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.table.headers, event.previousIndex, event.currentIndex);
  }

  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value) {
      this.table.headers.push(value);
      this.table.data.forEach(item => item[value] = 0);
    }
    event.chipInput!.clear();
  }

  remove(header: string) {
    const index = this.table.headers.indexOf(header);
    if (index >= 0) {
      this.table.headers.splice(index, 1);
      this.table.data.forEach(item => delete item[header]);
    }
  }

  generateDiscountData() {
    if (!this.standardConfig || this.editing) return;

    this.table.headers.push("low", "high", "discount");

    this.table.addTableData({
      low: 0,
      high: Math.round((this.min - 0.01) * 100) / 100,
      discount: 0
    });

    this.discountStep ??= this.discountStart;

    for (let i = this.min, discount = this.discountStart; i <= this.max; i+=this.step, discount+=this.discountStep) {
      this.table.addTableData({
        low: Math.round(i * 100) / 100,
        high: Math.round((i + this.step - 0.01) * 100) / 100,
        discount: Math.round(discount * 100) / 100,
      });
    }
  }

  setName(fieldName: string) {
    this.table.name = this.titleCasePipe.transform(fieldName);
  }

  ngOnDestroy() {
    delete this.table;
  }
}
