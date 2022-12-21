import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Contract, ProductInfo, DeliveryDates, PaymentTerms } from '@shared/classes/contract';
import { Mass } from '@shared/classes/mass';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';

@Component({
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
})
export class ContractFormComponent implements OnInit {
  @Input() currentContract: Contract;

  public contractForm: UntypedFormGroup;

  public productsList: Product[] = [];
  public plantsList: string[];
  public updateStatus: string = '';

  constructor(
    private fb: UntypedFormBuilder,
    private db: Firestore
  ) { }

  ngOnInit() {
    Product.getProductList(this.db, this.currentContract.ref.parent.parent.id).then(productList => {
      this.productsList = productList;
    });

    Plant.getPlantList(this.db, this.currentContract.ref.parent.parent.id).then(plantList => {
      this.plantsList = plantList.map(p => p.ref.id);
    });

    this.contractForm = this.fb.group({
      contractType: [{value: this.currentContract.ref.parent.id, disabled: true}, Validators.required],
      id: [{value: this.currentContract.id, disabled: true}, [Validators.required]],
      client: [{value: this.currentContract.clientName, disabled: true}, Validators.required],
      quantity: [ {value: this.currentContract.quantity, disabled: this.currentContract.status != 'pending'}, Validators.required],
      quantityUnits: [{value: 'lbs', disabled: this.currentContract.status != 'pending' }, Validators.required],
      product: [{value: this.currentContract.productInfo.name, disabled: this.currentContract.status != 'pending' }, Validators.required],
      price: [{value: this.currentContract.pricePerBushel, disabled: this.currentContract.status != 'pending' }, Validators.required],
      priceUnit: [{value: 'bushels', disabled: this.currentContract.status != 'pending' }, Validators.required],
      market_price: [{value: this.currentContract.market_price, disabled: this.currentContract.status != 'pending' }],
      grade: [{value: this.currentContract.grade, disabled: this.currentContract.status != 'pending' }, Validators.required],
      aflatoxin: [{value: this.currentContract.aflatoxin, disabled: this.currentContract.status != 'pending' }, Validators.required],
      deliveryDateStart: [{value: this.currentContract.delivery_dates.begin, disabled: this.currentContract.status != 'pending' }],
      deliveryDateEnd: [{value: this.currentContract.delivery_dates.end, disabled: this.currentContract.status != 'pending' }],
      plants: [{value: (this.currentContract.plants || []), disabled: this.currentContract.status != 'pending'}],
      paymentTerms: this.fb.group({
        before: [{value: this.currentContract.paymentTerms.before, disabled: this.currentContract.status != 'pending' }],
        origin: [{value: this.currentContract.paymentTerms.origin, disabled: this.currentContract.status != 'pending' }],
        paymentTerms: [{value: this.currentContract.paymentTerms.paymentTerms, disabled: this.currentContract.status != 'pending' }],
        measurement: [{value: this.currentContract.paymentTerms.measurement, disabled: this.currentContract.status != 'pending' }]
      })
    });
  }

  submitChanges() {
    const formData = this.contractForm.getRawValue();
    const product = this.productsList.find(p => p.ref.id == formData.product);

    this.currentContract.quantity = this.getQuantity(product);
    this.currentContract.product = product.ref.withConverter(Product.converter);
    this.currentContract.productInfo = new ProductInfo({moisture: product.moisture, name: product.ref.id, weight: product.weight});
    this.currentContract.pricePerBushel = this.getBushelPrice(product);
    this.currentContract.market_price = formData.market_price;
    this.currentContract.grade = formData.grade; 
    this.currentContract.aflatoxin = formData.aflatoxin;
    this.currentContract.delivery_dates = new DeliveryDates({
      begin: new Date(formData.deliveryDateStart),
      end: new Date(formData.deliveryDateEnd)
    });
    this.currentContract.paymentTerms = new PaymentTerms({
      before: formData.paymentTerms.before,
      measurement: formData.paymentTerms.measurement,
      origin: formData.paymentTerms.origin,
      paymentTerms: formData.paymentTerms.paymentTerms
    });

    this.updateStatus = 'pending';
    this.currentContract.set().then(val => {
      this.updateStatus = 'success';
    }, val => {
      this.updateStatus = 'failure';
    });
  }

  private getBushelPrice(product: Product): number{
    const form = this.contractForm.getRawValue();
    const price = form.price;
    
    if(form.priceUnit == 'bushels'){
      return price;
    }
    if(form.priceUnit == 'lbs'){
      return price * product.weight;
    }
    if(form.priceUnit == 'CWT'){
      return price / 100 * product.weight;
    }
    if(form.priceUnit == 'mtons'){
      return price / 2204.6 * product.weight;
    }

    return 0;
  }

  private getQuantity(product: Product): Mass {
    let quantity = this.contractForm.getRawValue().quantity;
    let unit = this.contractForm.getRawValue().quantityUnits;

    if(unit == "bushels")  {
      quantity = quantity * product.weight;
      unit = "lbs"
    }

    const mass = new Mass(quantity, unit);
    return mass;
  }

  addPlantChip(plant: string): void {
    if(this.currentContract.status != 'pending') return;
    const chosenPlants = this.contractForm.get('plants').value as string[];

    if(!this.chipIsChosen(plant)) {
      chosenPlants.push(plant);
      this.contractForm.get('plants').setValue(chosenPlants);
    }
  }

  removePlantChip(plant: string) {
    if(this.currentContract.status != 'pending') return; 
    const chosenPlants = this.contractForm.get('plants').value as string[];
    const index: number = chosenPlants.indexOf(plant);

    if(index >= 0) {
      chosenPlants.splice(index, 1);
      this.contractForm.get('plants').setValue(chosenPlants);
    }
  }

  chipIsChosen(plant: string) {
    const chosenPlants = this.contractForm.get('plants').value as string[];
    return chosenPlants.findIndex(p => p == plant) != -1;
  }
}
