import { Pipe, PipeTransform, QueryList, TemplateRef } from '@angular/core';

@Pipe({
  name: 'listFind'
})
export class ListFindPipe implements PipeTransform {

  transform(list: QueryList<TemplateRef<any>>, fieldName: string, value: any): TemplateRef<any> {
    return list.find(t => t[fieldName] == value);
  }

}
