import { Component, Directive, Inject, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Contract } from '@shared/classes/contract';
import { Liquidation } from '@shared/classes/liquidation';
import { PAYMENT_METHODS, PAYMENT_TYPES, Payment } from '@shared/classes/payment';

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

  }

  test() {
    console.log(this.data.payment)
    console.log(this.selectedTotal, this.difference)
  }

  setAmounts() {
    this.selectedTotal = this.data.payment.paidDocumentRefs.reduce((prev, current) => prev + current.amount, 0);
    this.difference = this.data.payment.amount - this.selectedTotal;
  }

  reset() {
    this.data.payment.paidDocumentRefs = [];
    this.selectedTotal = this.difference = 0;
  }

}

interface SetPaymentDialogData {
  payment: Payment;
  liquidations: Liquidation[];
  contract?: Contract;
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
    return control.value === 'default' && !(this.liquidationsCount > 0) ? { noLiquidations: true } : null;
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

    typeCtrl?.setErrors(typeCtrl?.value === 'default' && !(paidDocumentsCtrl?.value?.length > 0) ? { noLiquidationsSelected: true} : null);
    return null;
  }
}
