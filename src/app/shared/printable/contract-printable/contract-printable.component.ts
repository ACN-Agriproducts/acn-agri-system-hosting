import { Component, OnInit, Input } from '@angular/core';
import { Weight } from '@shared/Weight/weight';
import { WeightUnits } from '@shared/WeightUnits/weight-units';

@Component({
  selector: 'app-contract-printable',
  templateUrl: './contract-printable.component.html',
  styleUrls: ['./contract-printable.component.scss'],
})
export class ContractPrintableComponent implements OnInit {

  @Input() contractForm: any;
  @Input() productsList: any[];
  @Input() weight: Weight;
  @Input() date: Date;

  constructor() { }

  ngOnInit() {}

  getUnits(name: string): number {
    if(this.contractForm.product) {
      const tempProduct = this.productsList.find(p => p.name == this.contractForm.product)
      return this.weight.convertUnit(WeightUnits.getUnits(name, tempProduct.weight)).amount;  
    }
    return this.weight.convertUnit(WeightUnits.getUnits(name)).amount;
  }

  isPurchase = () => this.contractForm.contractType == "purchaseContracts";

  getPriceInBushels(): number {
    const price = this.contractForm.price;
    let bushelWeight = 56;

    if(this.productsList) {
      const product = this.productsList.find(p => p.name == this.contractForm.product);

      if(product) {
        bushelWeight = product.weight;
      }
    }

    if(this.contractForm.priceUnit == 'bushels'){
      return price;
    }
    if(this.contractForm.priceUnit == 'lbs'){
      return price * bushelWeight;
    }
    if(this.contractForm.priceUnit == 'CWT'){
      return price / 100 * bushelWeight;
    }
    if(this.contractForm.priceUnit == 'mtons'){
      return price / 2204.6 * bushelWeight;
    }
  }

  getPriceInCWT(): number {
    const price = this.contractForm.price;
    let bushelWeight = 56;

    if(this.productsList) {
      const product = this.productsList.find(p => p.name == this.contractForm.product);

      if(product) {
        bushelWeight = product.weight;
      }
    }

    if(this.contractForm.priceUnit == 'bushels'){
      return price / bushelWeight * 100;
    }
    if(this.contractForm.priceUnit == 'lbs'){
      return price * 100;
    }
    if(this.contractForm.priceUnit == 'CWT'){
      return price;
    }
    if(this.contractForm.priceUnit == 'mtons'){
      return price / 2204.6 * 100;
    }
  }

  getPriceInMTon(): number {
    const price = this.contractForm.price;
    let bushelWeight = 56;

    if(this.productsList) {
      const product = this.productsList.find(p => p.name == this.contractForm.product);

      if(product) {
        bushelWeight = product.weight;
      }
    }

    if(this.contractForm.priceUnit == 'bushels'){
      return price / bushelWeight * 2204.6;
    }
    if(this.contractForm.priceUnit == 'lbs'){
      return price * 2204.6;
    }
    if(this.contractForm.priceUnit == 'CWT'){
      return price / 100 * 2204.6;
    }
    if(this.contractForm.priceUnit == 'mtons'){
      return price;
    }
  }
}
