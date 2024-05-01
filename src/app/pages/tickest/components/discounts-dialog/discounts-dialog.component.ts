import { Component, Inject, OnInit } from '@angular/core';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { TranslocoService } from '@ngneat/transloco';
import { MoneyDiscounts, Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-discounts-dialog',
  templateUrl: './discounts-dialog.component.html',
  styleUrls: ['./discounts-dialog.component.scss'],
})
export class DiscountsDialogComponent implements OnInit {
  discounts: [string, number][];
  submitting: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Ticket,
    public dialogRef: MatDialogRef<DiscountsDialogComponent>,
    private db: Firestore,
    private session: SessionInfo,
    private snack: SnackbarService,
    private transloco: TranslocoService
  ) { }

  ngOnInit() {
    this.discounts = Object.entries(this.data.moneyDiscounts);
    this.submitting = false;
  }

  newDiscount(): void {
    const name = 'discount';
    let index = this.discounts.length + 1;

    while(this.discounts.some(e => e[0] == `${name} ${index}`)) ++index;
    this.discounts.push([`${name} ${index}`, 0]);
  }

  isValid(): boolean {
    if(this.submitting) return false;

    const testMap: Map<string, number> = new Map(this.discounts);
    return testMap.size == this.discounts.length;
  }

  remove(index: number): void {
    this.discounts.splice(index, 1);
  }

  submit() {
    this.submitting = true;
    const discountsObject: MoneyDiscounts = {};
    this.discounts.forEach(e => discountsObject[e[0]] = e[1]);
    updateDoc(this.data.ref.withConverter(null), {
      moneyDiscounts: discountsObject
    }).then(() => {
      this.snack.openTranslated("Discounts updated", 'success');
      this.dialogRef.close();
    })
    .catch(error => {
      this.submitting = false;
      console.error(error);
      this.snack.openTranslated("Update Error: Could not update discounts.", 'error');
    });
  }
}
