import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Pipe({
  name: 'translocoNested'
})
export class TranslocoNestedPipe implements PipeTransform {

  constructor(private transloco: TranslocoService) {}

  transform(value: string, nestedKeys: string | string[]): string {
    if (typeof nestedKeys !== 'string') {
      nestedKeys = nestedKeys.join('.');
    }
    return this.transloco.translate(`${nestedKeys}.${value}`);
  }

}
