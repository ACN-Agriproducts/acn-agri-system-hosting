import { Component, Directive, ElementRef, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { Status } from '@shared/classes/company';
import { Liquidation, TicketInfo } from '@shared/classes/liquidation';
import { PAYMENT_METHODS, PAYMENT_TYPES, PaidDocument, Payment } from '@shared/classes/payment';
import { DocumentReference } from 'firebase/firestore';

@Component({
  selector: 'app-set-payment-dialog',
  templateUrl: './set-payment-dialog.component.html',
  styleUrls: ['./set-payment-dialog.component.scss'],
})
export class SetPaymentDialogComponent implements OnInit {
  @ViewChild('paidDocuments') paidDocuments: ElementRef<MatSelectionList>;

  // readonly PAYMENT_TYPES = PAYMENT_TYPES;
  readonly PAYMENT_METHODS = PAYMENT_METHODS;
  readonly SETPAYMENTLIQUIDATION: SetPaymentLiquidation;

  public selectedTotal: number = 0;
  public difference: number = 0;
  public selectedLiquidations: (Liquidation | SetPaymentLiquidation)[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SetPaymentDialogData,
    private dialogRef: MatDialogRef<SetPaymentDialogComponent>
  ) { }

  ngOnInit() {
    this.data.readonly ??= true;
    this.data.liquidations = this.data.liquidations
    .map((liq, index) => ({
      status: liq.status,
      total: liq.total,
      amountPaid: liq.amountPaid,
      date: liq.date,
      ref: liq.ref,
      id: index + 1,
      selected: false,
      tickets: liq.tickets
    }));

    this.selectedLiquidations = this.data.liquidations.filter((liq: SetPaymentLiquidation) => {
      const paidDoc = this.data.payment.paidDocuments.find(doc => doc.ref.id === liq.ref.id);
      liq.amountPaid -= paidDoc?.amount ?? 0;
      return liq.selected = !!paidDoc;
    });
  }

  amountChange(value: any) {
    this.data.payment.amount = value;
    this.difference = this.data.payment.amount - this.selectedTotal;
  }

  paidDocumentsChange() {
    this.selectedTotal = this.selectedLiquidations?.reduce((prev, current) => prev + current.total - current.amountPaid, 0);
    this.amountChange(this.selectedTotal === 0 ? null : this.selectedTotal);
  }

  resetSelection() {
    this.data.payment.paidDocuments = [];
    this.selectedTotal = this.difference = 0;
  }

  setPaidDocuments() {
    let pay = this.data.payment.amount;
    this.data.payment.paidDocuments = this.selectedLiquidations.map((liq: SetPaymentLiquidation) => {
      if (pay <= 0) return;

      const outstanding = liq.total - liq.amountPaid;
      const amountToPay = pay >= outstanding ? outstanding : pay;
      pay -= amountToPay;

      return {
        ref: liq.ref,
        amount: amountToPay,
        id: liq.tickets.map(t => t.id).join(', ')
      }
    });
    this.dialogRef.close(this.data.payment);
  }

}

interface SetPaymentDialogData {
  payment: Payment | {
    type: string;
    date: Date;
    accountName: string;
    paymentMethod: string;
    amount: number;
    paidDocuments: PaidDocument[];
    notes: string;
  };
  liquidations: (Liquidation | SetPaymentLiquidation)[];
  readonly?: boolean;
}

interface SetPaymentLiquidation {
  status: Status;
  total: number;
  amountPaid: number;
  date: Date;
  ref: DocumentReference;
  selected: boolean;
  tickets: TicketInfo[],
  id: number;
}

@Directive({
  selector: '[availableSelection]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: ValidPaymentSelectionDirective,
    multi: true
  }]
})
export class ValidPaymentSelectionDirective implements Validator {
  @Input('availableSelection') liquidations: (Liquidation | SetPaymentLiquidation)[];

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.liquidations?.filter(liq => liq.status !== 'cancelled').length > 0 && control.value?.length === 0) {
      return { noLiquidationsSelected: true };
    }
    return null;
  }
}
