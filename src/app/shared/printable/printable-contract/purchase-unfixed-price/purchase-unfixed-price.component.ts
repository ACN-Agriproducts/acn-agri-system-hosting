import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { Utils } from '../acnutils.class';

@Component({
  selector: 'contract-purchase-unfixed-price',
  templateUrl: './purchase-unfixed-price.component.html',
  styleUrls: [
    './purchase-unfixed-price.component.scss',
    '../contract-styles.scss'
  ],
})
export class PurchaseUnfixedPriceComponent implements OnInit {
  @Input() contractForm: Contract;
  @Input() focusedField: string;

  utils = Utils;

  constructor() { }

  ngOnInit() {}
}
