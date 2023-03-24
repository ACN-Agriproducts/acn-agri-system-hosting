import { Pipe, PipeTransform, QueryList, TemplateRef } from '@angular/core';
import { TypeTemplateDirective } from '@shared/directives/type-template/type-template.directive';

@Pipe({
  name: 'listFind'
})
export class ListFindPipe implements PipeTransform {

  transform<T>(list: Iterable<T>, fieldName: string, value: any): T {
    for(var t of list) {
      if(t[fieldName] == value) return t;
    }
  }
}
