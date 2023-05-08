import { Component, Input, OnInit } from '@angular/core';
import { ProductionOrder } from '@shared/classes/production-order';

@Component({
  selector: 'app-production-order-default',
  templateUrl: './production-order-default.component.html',
  styleUrls: ['./production-order-default.component.scss'],
})
export class ProductionOrderDefaultComponent implements OnInit {
  @Input() order: ProductionOrder;

  constructor() { }

  ngOnInit() {}

}
