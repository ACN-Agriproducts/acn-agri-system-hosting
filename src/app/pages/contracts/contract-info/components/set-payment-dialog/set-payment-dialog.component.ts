import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Payment } from '@shared/classes/payment';

@Component({
  selector: 'app-set-payment-dialog',
  templateUrl: './set-payment-dialog.component.html',
  styleUrls: ['./set-payment-dialog.component.scss'],
})
export class SetPaymentDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public payment: Payment,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    console.log(this.payment)
  }

}

interface PaymentDialogData {

}
