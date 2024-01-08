import { Directive, Input, TemplateRef, Host, Injectable, NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TemplateRegistry {
  public templates: { [name: string]: TemplateRef<any> } = Object.create(null);

  constructor() {}
}

@Pipe({
  name: 'templateRef'
})
export class TemplateRefPipe implements PipeTransform {
  
  constructor(private registry: TemplateRegistry) {}

  transform(name: string): TemplateRef<any>|undefined {
    return this.registry.templates[name];
  }
}

@Directive({
  selector: '[templateRef]',
})
export class TemplateRefDirective {
  @Input('templateRef') templateRef: string;

  private name: string;

  constructor(private registry: TemplateRegistry, private template: TemplateRef<any>) {}

  ngOnInit(): void {
    this.name = this.templateRef;
    this.registry.templates[this.name] = this.template;
  }

  ngOnDestroy() {
    delete this.registry.templates[this.name];
  }
}


@NgModule({
    declarations: [
      TemplateRefDirective,
      TemplateRefPipe,
    ],
    exports: [
      TemplateRefDirective,
      TemplateRefPipe,
    ],
  })
  export class TemplateRefModule  {}
