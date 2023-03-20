import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'contract-purchase-to-deposit',
  templateUrl: './purchase-to-deposit.component.html',
  styleUrls: [
    './purchase-to-deposit.component.scss',
    '../contract-styles.scss'
  ],
})
export class PurchaseToDepositComponent implements OnInit {
  @Input() contractForm: Contract;

  constructor() { }

  ngOnInit() {}

}
