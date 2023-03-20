import { Component, OnInit, Input } from '@angular/core';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'purchase-contract',
  templateUrl: './purchase-contract.component.html',
  styleUrls: [
    './purchase-contract.component.scss',
    '../contract-styles.scss',
    '../contract-english-styles.scss'
  ],
})
export class PurchaseContractComponent implements OnInit {

  @Input() contractForm: Contract;

  constructor() {}

  ngOnInit() {}
}
