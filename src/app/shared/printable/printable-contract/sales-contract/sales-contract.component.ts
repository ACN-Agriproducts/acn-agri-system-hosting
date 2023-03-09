import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'sales-contract',
  templateUrl: './sales-contract.component.html',
  styleUrls: [
    './sales-contract.component.scss',
    '../printable-contract-styles.scss'
  ],
})
export class SalesContractComponent implements OnInit {
  @Input() contractForm: Contract;

  public product: string;

  constructor() { }

  ngOnInit() {
    console.log(this.contractForm)
    console.log(this.contractForm.product.id)
  }

}
