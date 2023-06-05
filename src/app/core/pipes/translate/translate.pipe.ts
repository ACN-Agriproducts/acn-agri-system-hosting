import { Pipe, PipeTransform } from '@angular/core';

const translate: Map<string, string> = new Map<string, string>([
  ["pounds", "libras"],
  ["kilograms", "kilogramos"],
  ["metric tons", "toneladas metricas"],
]);

// TODO: THIS PIPE IS A TEMPORARY SOLUTION WHILE INTERNATIONALIZATION IS BEING WORKED ON

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {

  transform(value: string): string {
    return translate.get(value) || value;
  }

}
