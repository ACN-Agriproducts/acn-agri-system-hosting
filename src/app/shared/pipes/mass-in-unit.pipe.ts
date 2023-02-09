import { Pipe, PipeTransform } from '@angular/core';
import { Mass, units } from '@shared/classes/mass';

@Pipe({
  name: 'massInUnit'
})
export class MassInUnitPipe implements PipeTransform {

  transform(value: Mass, unit?: units): number {
    return unit ? value.getMassInUnit(unit) : value.get();
  }

}
