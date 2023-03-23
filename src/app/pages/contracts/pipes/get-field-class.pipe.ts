import { Pipe, PipeTransform } from '@angular/core';
import { FormField } from '@shared/classes/contract-settings';

@Pipe({
  name: 'getFieldClass'
})
export class GetFieldClassPipe implements PipeTransform {

  transform(field: FormField): string[] {
    const classes: string[] = [];
    if(field?.class) classes.push(field?.class);
    if(field?.width) classes.push(`span-${field?.width}`);

    return classes;
  }

}
