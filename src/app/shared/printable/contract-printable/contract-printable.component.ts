import { Component, OnInit, Input } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { Product } from '@shared/classes/product';
import { Weight } from '@shared/Weight/weight';
import { WeightUnits } from '@shared/WeightUnits/weight-units';

@Component({
  selector: 'app-contract-printable',
  templateUrl: './contract-printable.component.html',
  styleUrls: ['./contract-printable.component.scss'],
})
export class ContractPrintableComponent implements OnInit {

  @Input() contractForm: Contract;
  @Input() productsList: any[];
  public date: Date;

  constructor() {}

  ngOnInit() {
    console.log(this.contractForm);
    this.date = this.contractForm.date;
  }

  getProductObject(): Product {
    return this.productsList?.find(p => (p.ref?.id ?? p.name) == this.getProduct()) ?? (this.contractForm as Contract).product;
  }

  getProduct(): string {
    return this.contractForm.product?.id;
  }

  isPurchase = () => this.contractForm.type == "purchase";

  getPriceInBushels(): number {
    const price = this.contractForm.pricePerBushel;
    return price;
    // let bushelWeight = 56;

    // if(this.productsList) {
    //   const product = this.productsList.find(p => p.name == this.getProduct());

    //   if(product) {
    //     bushelWeight = product.weight;
    //   }
    // }

    // if(this.contractForm.pricePerBushel) {
    //   return this.contractForm.pricePerBushel;
    // }

    // if(this.contractForm.priceUnit == 'bushels'){
    //   return price;
    // }
    // if(this.contractForm.priceUnit == 'lbs'){
    //   return price * bushelWeight;
    // }
    // if(this.contractForm.priceUnit == 'CWT'){
    //   return price / 100 * bushelWeight;
    // }
    // if(this.contractForm.priceUnit == 'mtons'){
    //   return price / 2204.6 * bushelWeight;
    // }
  }

  getPriceInCWT(): number {
    const price = this.contractForm.pricePerBushel;
    let bushelWeight = 56;

    if(this.productsList) {
      const product = this.productsList.find(p => p.name == this.getProduct());

      if(product) {
        bushelWeight = product.weight;
      }
    }

    return price / bushelWeight * 100;

    // if(this.contractForm.pricePerBushel) {
    //   return this.contractForm.pricePerBushel / bushelWeight * 100;
    // }

    // if(this.contractForm.priceUnit == 'bushels'){
    //   return price / bushelWeight * 100;
    // }
    // if(this.contractForm.priceUnit == 'lbs'){
    //   return price * 100;
    // }
    // if(this.contractForm.priceUnit == 'CWT'){
    //   return price;
    // }
    // if(this.contractForm.priceUnit == 'mtons'){
    //   return price / 2204.6 * 100;
    // }
  }

  getPriceInMTon(): number {
    const price = this.contractForm.pricePerBushel;
    let bushelWeight = 56;

    if(this.productsList) {
      const product = this.productsList.find(p => p.name == this.contractForm.product);

      if(product) {
        bushelWeight = product.weight;
      }
    }

    return price / bushelWeight * 2204.6;

    // if(this.contractForm.pricePerBushel) {
    //   return this.contractForm.pricePerBushel / bushelWeight * 2204.6;
    // }

    // if(this.contractForm.priceUnit == 'bushels'){
    //   return price / bushelWeight * 2204.6;
    // }
    // if(this.contractForm.priceUnit == 'lbs'){
    //   return price * 2204.6;
    // }
    // if(this.contractForm.priceUnit == 'CWT'){
    //   return price / 100 * 2204.6;
    // }
    // if(this.contractForm.priceUnit == 'mtons'){
    //   return price;
    // }
  }

  getClient(): any {
    return this.contractForm.clientInfo || this.contractForm.client;
  }
}
