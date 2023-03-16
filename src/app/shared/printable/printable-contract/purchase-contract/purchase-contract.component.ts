import { Component, OnInit, Input } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { Product } from '@shared/classes/product';

@Component({
  selector: 'purchase-contract',
  templateUrl: './purchase-contract.component.html',
  styleUrls: ['./purchase-contract.component.scss'],
})
export class PurchaseContractComponent implements OnInit {

  @Input() contractForm: Contract;

  constructor() {}

  ngOnInit() {
    // console.log(this.contractForm)
  }

  // getProductObject(): Product {
  //   return this.productsList?.find(p => (p.ref?.id ?? p.name) == this.getProduct()) ?? (this.contractForm as Contract).product;
  // }

  getProduct(): string {
    return this.contractForm.product?.id;
  }

  isPurchase = () => this.contractForm.type == "purchase";

  getClient(): any {
    return this.contractForm.clientInfo || this.contractForm.client;
  }
}
