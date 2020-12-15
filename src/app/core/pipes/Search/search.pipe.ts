import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(dataList: any, value?: any, obj?: string, obj2?: string, filter?: boolean): any {

    const result = dataList.filter((item) => {
      return item[obj].toString().trim().toUpperCase().substr(0, value.length)
        === value.toString().trim().toUpperCase()
        || item[obj2].toString().trim().toUpperCase().substr(0, value.length) 
        === value.toString().trim().toUpperCase();
    });
    return result;
  }

}
