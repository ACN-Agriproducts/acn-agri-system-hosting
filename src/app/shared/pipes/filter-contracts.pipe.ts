import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterContracts'
})
export class FilterContractsPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
