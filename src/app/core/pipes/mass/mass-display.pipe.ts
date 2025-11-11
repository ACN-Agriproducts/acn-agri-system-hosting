import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Mass, units } from '@shared/classes/mass';

@Injectable({
  providedIn: 'root'
})
@Pipe({
  name: 'massDisplay'
})
export class MassDisplayPipe implements PipeTransform {

  transform(value: Mass, decimalDigits: number = 2, unit: units = value.defaultUnits, maskFalsyValues: boolean = false, ...others: any[]): string {
    let massInUnit: number | string = value.getMassInUnit(unit);
    massInUnit = maskFalsyValues ? (massInUnit || '--') : massInUnit;

    return `${massInUnit.toLocaleString('en-US', {
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits
    })} ${unit}`;
  }

}
