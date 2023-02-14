import { Pipe, PipeTransform, TemplateRef } from '@angular/core';

@Pipe({
  name: 'hashmap'
})
export class HashMapPipe implements PipeTransform {

  // passing in parent component and referencing with [] - X
  // evals - X
  // passing in array of templateRefs and finding by name - X
  // 
  transform<K, U>(templateMap: Map<K, U>, key: K): U {
    return templateMap?.get(key) ?? null;
  }

}
