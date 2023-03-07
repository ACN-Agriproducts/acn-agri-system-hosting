import { Directive, Input } from '@angular/core';
import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { UniqueIdValidator } from './unique-id-validator';

@Directive({
  selector: '[uniqueId]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: UniqueIdValidatorDirective,
      multi: true
    }
  ]
})
export class UniqueIdValidatorDirective implements AsyncValidator{
  @Input() uniqueId: () => string;

  constructor(private validator: UniqueIdValidator) { }

  validate(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    console.log("help3");
    console.log(this.uniqueId);
    this.validator.setGetterFunction(this.uniqueId);
    return this.validator.validate(control);
  }
}
