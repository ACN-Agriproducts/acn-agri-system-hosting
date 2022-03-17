import { Component, OnInit, Input } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { Weight } from '@shared/Weight/weight';
import { WeightUnits } from '@shared/WeightUnits/weight-units';

@Component({
  selector: 'app-contract-printable',
  templateUrl: './contract-printable.component.html',
  styleUrls: ['./contract-printable.component.scss'],
})
export class ContractPrintableComponent implements OnInit {

  @Input() contractForm: Contract | any;
  @Input() productsList: any[];
  public date: Date;

  constructor() {}

  ngOnInit() {
    if (!(this.contractForm.date instanceof Date)) {
      this.date = this.contractForm.date.toDate();
      this.contractForm.delivery_dates.begin = this.contractForm.delivery_dates.begin.toDate();
      this.contractForm.delivery_dates.end = this.contractForm.delivery_dates.end.toDate();
    }
    else {
      this.date = this.contractForm.date;
    }
  }

  getProduct(): string {
    if(this.contractForm.product.ref){
      return this.contractForm.product.ref.id;
    }

    return this.contractForm.product.id;
  }

  getUnits(name: string): number {
    const weight = new Weight(this.contractForm.quantity, WeightUnits.Pounds);

    if(this.contractForm.product) {
      const tempProduct = this.productsList.find(p => p.name == this.getProduct())
      return weight.convertUnit(WeightUnits.getUnits(name, tempProduct.weight)).amount;  
    }
    return weight.convertUnit(WeightUnits.getUnits(name)).amount;
  }

  isPurchase = () => this.contractForm.contractType == "purchaseContracts";

  getPriceInBushels(): number {
    const price = this.contractForm.price;
    let bushelWeight = 56;

    if(this.productsList) {
      const product = this.productsList.find(p => p.name == this.getProduct());

      if(product) {
        bushelWeight = product.weight;
      }
    }

    if(this.contractForm.pricePerBushel) {
      return this.contractForm.pricePerBushel;
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
      const product = this.productsList.find(p => p.name == this.getProduct());

      if(product) {
        bushelWeight = product.weight;
      }
    }

    if(this.contractForm.pricePerBushel) {
      return this.contractForm.pricePerBushel / bushelWeight * 100;
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

    if(this.contractForm.pricePerBushel) {
      return this.contractForm.pricePerBushel / bushelWeight * 2204.6;
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

  getClient(): any {
    return this.contractForm.clientInfo || this.contractForm.client;
  }
}
