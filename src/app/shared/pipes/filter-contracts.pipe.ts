import { Pipe, PipeTransform } from '@angular/core';
import { Contract } from '@shared/classes/contract';

@Pipe({
  name: 'filterContracts'
})
export class FilterContractsPipe implements PipeTransform {
  transform(contractsList: Contract[], ...args: unknown[]): Contract[] {
    return contractsList?.filter(c => c.id >= 0) ?? [];
  }
}
