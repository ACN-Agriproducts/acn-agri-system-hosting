import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'contract-purchase-fixed-price',
  templateUrl: './purchase-fixed-price.component.html',
  styleUrls: [
    './purchase-fixed-price.component.scss',
    '../contract-styles.scss'
  ],
})
export class PurchaseFixedPriceComponent implements OnInit {
  @Input() contractForm: Contract;

  constructor() { }

  ngOnInit() {}

}
