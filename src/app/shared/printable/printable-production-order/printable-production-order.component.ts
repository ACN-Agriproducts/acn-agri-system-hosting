import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ProductionOrder } from '@shared/classes/production-order';
import { TypeTemplateDirective } from '@shared/directives/type-template/type-template.directive';

@Component({
  selector: 'app-printable-production-order',
  templateUrl: './printable-production-order.component.html',
  styleUrls: ['./printable-production-order.component.scss'],
})
export class PrintableProductionOrderComponent implements OnInit {
  @ViewChildren(TypeTemplateDirective) templates: QueryList<TypeTemplateDirective>;

  @Input() order: ProductionOrder;

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    
  }

  getTemplate<T>(list: Iterable<T>, fieldName: string, value: any): T {
    if (list == null) return;
    for (var t of list) {
      if (t[fieldName] == value) return t;
    }
  }

}
