import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { PrintableContractUtilitiesService } from '../printable-contract-utilities.service';

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
  @Input() focusedField: string;
  readonly contractType: string = 'compra_aDeposito';

  constructor(public utils: PrintableContractUtilitiesService) { }

  ngOnInit() {}

}
