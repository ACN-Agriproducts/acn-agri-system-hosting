import { Component, Input, OnInit } from '@angular/core';
import { LoadOrder } from '@shared/classes/load-orders.model';

@Component({
  selector: 'app-printable-load-order',
  templateUrl: './printable-load-order.component.html',
  styleUrls: ['./printable-load-order.component.scss'],
})
export class PrintableLoadOrderComponent implements OnInit {
  @Input() order: LoadOrder;

  constructor() { }

  ngOnInit() {
    console.log(this.order)
  }

}
