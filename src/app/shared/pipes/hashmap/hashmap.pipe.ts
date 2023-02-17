import { Pipe, PipeTransform, TemplateRef } from '@angular/core';

@Pipe({
  name: 'hashmap'
})
export class HashMapPipe implements PipeTransform {
  
  transform<K, U>(templateMap: Map<K, U>, key: K): U {
    return templateMap?.get(key) ?? null;
  }

}
