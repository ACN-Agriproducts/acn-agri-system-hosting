import { DatePipe } from '@angular/common';
import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { MONTH_CODES, PRODUCT_CODES } from '@shared/classes/contract';

@Pipe({
  name: 'flatPrice'
})
export class FlatPricePipe implements PipeTransform {

  readonly MONTH_CODES = MONTH_CODES;
  readonly PRODUCT_CODES = PRODUCT_CODES;

  constructor(
    private datepipe: DatePipe
  ) {}
  
  transform(futuresMonth: Date, base: number, productName: string): string {
    if (!futuresMonth || !base || !productName) return "";
    
    const productCode = PRODUCT_CODES[productName.toLocaleLowerCase()];
    if (!productCode) return "";
    
    let result: string = Math.round(base * 100).toString();
    result += productCode;
    result += MONTH_CODES[this.datepipe.transform(futuresMonth, "MMM").toLocaleUpperCase()];
    result +=  this.datepipe.transform(futuresMonth, "YY");

    return result;
  }

}

@Pipe({
  name: "maskZeros"
})
export class MaskZerosPipe implements PipeTransform {
  transform(value: string, format?: "NA"): string {
    const maskedValue = format === "NA" ? "N/A" : "--";
    return (!value || !(+(value?.replace(/,/g, "")))) ? maskedValue : value;
  }
}

@Pipe({
  name: "maskValue"
})
export class MaskValuePipe implements PipeTransform {
  transform(value: string, condition?: boolean, format?: "NA"): string {
    const maskedValue = format === "NA" ? "N/A" : "--";
    return condition ? maskedValue : value;
  }
}

@NgModule({
    declarations: [
      FlatPricePipe,
      MaskZerosPipe,
      MaskValuePipe
    ],
    exports: [
      FlatPricePipe,
      MaskZerosPipe,
      MaskValuePipe
    ],
  })
  export class PrintablePipesModule  {}
