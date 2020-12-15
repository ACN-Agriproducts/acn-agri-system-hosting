import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatString'
})
export class FormatStringPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return typeof (value);
  }

}
