import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Mass, units } from '@shared/classes/mass';

@Injectable({
  providedIn: 'root'
})
@Pipe({
  name: 'massDisplay'
})
export class MassDisplayPipe implements PipeTransform {

  transform(value: Mass, decimalDigits: number = 2, unit?: units, ...others: any[]): string {
    unit ??= value.defaultUnits;
    return `${value.getMassInUnit(unit).toLocaleString('en-US', {
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits
    })} ${unit}`;
  }

}
