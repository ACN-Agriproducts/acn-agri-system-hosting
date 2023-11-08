import { Component, Directive, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, NG_VALIDATORS, NgForm, ValidationErrors, Validator } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Contract } from '@shared/classes/contract';
import { Liquidation } from '@shared/classes/liquidation';
import { PAYMENT_METHODS, PAYMENT_TYPES, PaidDocument, Payment } from '@shared/classes/payment';

@Component({
  selector: 'app-set-payment-dialog',
  templateUrl: './set-payment-dialog.component.html',
  styleUrls: ['./set-payment-dialog.component.scss'],
})
export class SetPaymentDialogComponent implements OnInit {
  readonly PAYMENT_TYPES = PAYMENT_TYPES;
  readonly PAYMENT_METHODS = PAYMENT_METHODS;

  public selectedTotal: number = 0;
  public difference: number = 0;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SetPaymentDialogData,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.data.readonly ??= true;
  }

  test() {
    console.log(this.data.payment)
  }

  amountChange(value: any) {
    this.data.payment.amount = value == null ? value : +value.toFixed(3);
    this.difference = this.data.payment.amount - this.selectedTotal;
  }

  paidDocumentsChange() {
    this.selectedTotal = this.data.payment.paidDocumentRefs?.reduce((prev, current) => prev + current.amount, 0);
    this.amountChange(this.selectedTotal === 0 ? null : this.selectedTotal);
  }

  resetSelection() {
    this.data.payment.paidDocumentRefs = [];
    this.selectedTotal = this.difference = 0;
  }

}

@Directive({
  selector: '[paymentType]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: PaymentTypeDirective,
    multi: true
  }]
})
export class PaymentTypeDirective implements Validator {
  @Input('paymentType') liquidationsCount: number;

  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value === "default") {
      return !(this.liquidationsCount > 0) ? { noLiquidations: true } : null;
    }
    if (control.value === "prepay") {
      return this.liquidationsCount > 0 ? { liquidationsExist: true } : null;
    }
  }
}

@Directive({
  selector: '[liquidationsSelected]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: PaymentLiquidationsSelectedDirective,
    multi: true
  }]
})
export class PaymentLiquidationsSelectedDirective implements Validator {
  @Input('liquidationsSelected') liquidationsSelected: string[] = [];

  validate(formGroup: FormGroup): ValidationErrors | null {
    const typeCtrl = formGroup.controls[this.liquidationsSelected[0]];
    const paidDocumentsCtrl = formGroup.controls[this.liquidationsSelected[1]];

    paidDocumentsCtrl?.setErrors(typeCtrl?.value === 'default' && !(paidDocumentsCtrl?.value?.length > 0) ? { noLiquidationsSelected: true} : null);
    return null;
  }
}

interface SetPaymentDialogData {
  payment: Payment | {
    type: string;
    date: Date;
    accountName: string;
    paymentMethod: string;
    amount: number;
    paidDocumentRefs: PaidDocument[];
    notes: string;
  };
  liquidations: Liquidation[];
  readonly?: boolean;
}
