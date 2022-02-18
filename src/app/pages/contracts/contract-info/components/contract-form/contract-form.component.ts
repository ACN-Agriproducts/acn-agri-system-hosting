import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
})
export class ContractFormComponent implements OnInit {
  @Input() currentContract: any;
  @Input() contractRef: AngularFirestoreDocument;

  public contractForm: FormGroup;

  public productsList: any[] = [];
  public updateStatus: string = '';

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.contractRef.ref.parent.parent.collection('products').get().then(snap => {
      snap.docs.forEach(product => {
        let p = product.data();
        p.name = product.id;
        this.productsList.push(p);
      });
    })

    this.contractForm = this.fb.group({
      contractType: [{value: this.currentContract.contractType, disabled: true}, Validators.required],
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
      deliveryDateStart: [{value: this.currentContract.delivery_dates.begin.toDate(), disabled: this.currentContract.status != 'pending' }],
      deliveryDateEnd: [{value: this.currentContract.delivery_dates.end.toDate(), disabled: this.currentContract.status != 'pending' }],
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
    const productInfo = this.productsList.find(p => p.name == formData.product);

    let submitForm = {
      quantity: this.getQuantity(productInfo),
      product: this.contractRef.ref.parent.parent.collection('products').doc(formData.product),
      productInfo: {
        moisture: productInfo.moisture,
        name: formData.product,
        weight: productInfo.weight
      },
      pricePerBushel: this.getBushelPrice(productInfo),
      market_price: formData.market_price,
      grade: formData.grade,
      aflatoxin: formData.aflatoxin,
      delivery_dates: {
        begin: new Date(formData.deliveryDateStart),
        end: new Date(formData.deliveryDateEnd)
      },
      paymentTerms: {
        before: formData.paymentTerms.before,
        measurement: formData.paymentTerms.measurement,
        origin: formData.paymentTerms.origin,
        paymentTerms: formData.paymentTerms.paymentTerms
      }
    }

    this.updateStatus = 'pending';
    this.contractRef.update(submitForm).then(val => {
      this.updateStatus = 'success';
    }, val => {
      this.updateStatus = 'failure';
    });
  }

  private getBushelPrice(product: any): number{
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

  private getQuantity(product: any): number {
    console.log(product);
    const quantity = this.contractForm.getRawValue().quantity;
    const unit = this.contractForm.getRawValue().quantityUnits;

    if(unit == 'bushels') {
      return quantity * product.weight;
    }
    if(unit == 'lbs'){
      return quantity;
    }
    if(unit == 'CWT'){
      return quantity * 100;
    }
    if(unit == 'MTons'){
      return quantity * 2204.6;
    }
  }
}
