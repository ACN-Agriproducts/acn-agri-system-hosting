import { Directive, HostBinding } from '@angular/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';

export const MONTH_PICKER_FORMAT = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Directive({
  selector: '[appFutureDateFormat]',
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MONTH_PICKER_FORMAT }]
})
export class FutureDateFormatDirective {
  @HostBinding('style.background-color')
  backgroundColor:string = "yellow";
}
