import { Pipe, PipeTransform } from '@angular/core';
import { Mass, units } from '@shared/classes/mass';

@Pipe({
  name: 'massDisplay'
})
export class MassDisplayPipe implements PipeTransform {

  transform(value: Mass, decimalDigits: number = 2, unit?: units): unknown {
    unit ??= value.defaultUnits;
    return `${value.getMassInUnit(unit).toFixed(decimalDigits)} ${unit}`;
  }

}
