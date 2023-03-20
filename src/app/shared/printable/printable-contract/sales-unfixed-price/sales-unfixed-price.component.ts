import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'contract-sales-unfixed-price',
  templateUrl: './sales-unfixed-price.component.html',
  styleUrls: [
    './sales-unfixed-price.component.scss',
    '../printable-contract-styles.scss'
  ],
})
export class SalesUnfixedPriceComponent implements OnInit {
  @Input() contractForm: Contract;

  constructor() { }

  ngOnInit() {}

}
