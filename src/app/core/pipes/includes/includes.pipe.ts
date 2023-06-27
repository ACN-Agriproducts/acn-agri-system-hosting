import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includes'
})
export class IncludesPipe implements PipeTransform {

  transform<T>(list: Iterable<T>, value: T, ...args: unknown[]): boolean {
    for(let x of list) {
      if (x == value) return true;
    }

    return false;
  } 

}
