import { Pipe, PipeTransform } from '@angular/core';
import { Mass, units } from '@shared/classes/mass';

@Pipe({
  name: 'massInUnit'
})
export class MassInUnitPipe implements PipeTransform {

  transform(value: Mass, unit?: units, ...args: any[]): number {
    return unit ? value.getMassInUnit(unit) : 0;
  }

}
