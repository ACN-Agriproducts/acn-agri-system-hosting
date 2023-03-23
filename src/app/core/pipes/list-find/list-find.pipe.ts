import { Pipe, PipeTransform, QueryList, TemplateRef } from '@angular/core';
import { TypeTemplateDirective } from '@shared/directives/type-template/type-template.directive';

@Pipe({
  name: 'listFind'
})
export class ListFindPipe implements PipeTransform {

  transform(list: QueryList<TypeTemplateDirective>, fieldName: string, value: any): TemplateRef<any> {
    return list.find(t => t[fieldName] == value).templateRef;
  }

}
