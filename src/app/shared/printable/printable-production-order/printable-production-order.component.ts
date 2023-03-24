import { Component, Input, OnInit, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { ProductionOrder } from '@shared/classes/production-order';
import { TypeTemplateDirective } from '@shared/directives/type-template/type-template.directive';
import { Observable } from 'rxjs';

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
    console.log(this.templates)
  }

}
