import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'contract-sales-fixed-price',
  templateUrl: './sales-fixed-price.component.html',
  styleUrls: [
    './sales-fixed-price.component.scss',
    '../printable-contract-styles.scss'
  ],
})
export class SalesFixedPriceComponent implements OnInit {
  @Input() contractForm: Contract;

  constructor() { }

  ngOnInit() {}

}
