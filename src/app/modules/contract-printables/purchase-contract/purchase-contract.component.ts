import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { PrintableContractUtilitiesService } from '../printable-contract-utilities.service';

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
  @Input() focusedField: string;
  readonly contractType: string = 'purchase';

  constructor(public utils: PrintableContractUtilitiesService) {}

  ngOnInit() {}
}
