import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, ValidatorFn } from '@angular/forms';

@Directive({
  selector: '[appPositive]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: PositiveDirective,
    multi: true
  }]
})
export class PositiveDirective {
  validate(control: AbstractControl): ValidationErrors | null {
    return control.value <= 0 && control.value != null ? { positive: true } : null;
  }
}
