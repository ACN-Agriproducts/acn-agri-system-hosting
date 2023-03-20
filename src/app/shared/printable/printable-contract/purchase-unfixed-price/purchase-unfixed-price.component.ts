import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'contract-purchase-unfixed-price',
  templateUrl: './purchase-unfixed-price.component.html',
  styleUrls: [
    './purchase-unfixed-price.component.scss',
    '../printable-contract-styles.scss'
  ],
})
export class PurchaseUnfixedPriceComponent implements OnInit {
  @Input() contractForm: Contract;

  constructor() { }

  ngOnInit() {}

}
