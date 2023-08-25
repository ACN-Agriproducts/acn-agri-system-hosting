import { Pipe, PipeTransform } from '@angular/core';
import { Mass, units } from '@shared/classes/mass';

@Pipe({
  name: 'massInUnit'
})
export class MassInUnitPipe implements PipeTransform {

  transform(value: Mass, unit?: units, ...args: any[]): number {
    if (isNaN(unit ? value?.getMassInUnit(unit) : value?.amount)) {
      console.log(value)
    }
    return (unit ? value?.getMassInUnit(unit) : value?.amount) ?? 0;
  }

}
