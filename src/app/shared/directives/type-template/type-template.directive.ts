import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[typeTemplate]'
})
export class TypeTemplateDirective {
  @Input() typeTemplate: string;

  constructor(public templateRef: TemplateRef<any>) { }

}
