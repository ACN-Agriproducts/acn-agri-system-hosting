import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { WeightUnits } from '@shared/WeightUnits/weight-units';
import { Weight } from '@shared/Weight/weight';

@Component({
  selector: 'app-new-contract',
  templateUrl: './new-contract.page.html',
  styleUrls: ['./new-contract.page.scss'],
})
export class NewContractPage implements OnInit, OnDestroy {

  currentCompany: string;
  currentCompanyValue: any;
  contactList: any[];
  productsList: any[];
  clientsReady: boolean = false;
  productsReady: boolean = false;
  contractForm: FormGroup;
  currentSubs: Subscription[] = [];
  contractWeight: Weight;

  constructor(
    private fb: FormBuilder,
    private db: AngularFirestore,
    private localStorage: Storage,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany').then(val =>{
      this.currentCompany = val;
      console.log(`companies/${this.currentCompany}`)

      var tempSub = this.db.doc(`companies/${this.currentCompany}`).valueChanges().subscribe(val => {
        this.currentCompanyValue = val;
        this.contactList = val['contactList'].sort((a, b) =>{
            var nameA = a.name.toUpperCase()
            var nameB = b.name.toUpperCase()

            if(nameA < nameB){
              return -1;
            }
            if(nameA > nameB){
              return 1;
            }

            return 0;
          });
        this.clientsReady = true;
      })
      this.currentSubs.push(tempSub);

      tempSub = this.db.collection(`companies/${this.currentCompany}/products`).valueChanges({idField: 'name'}).subscribe(val => {
        this.productsList = val;
        this.productsReady = true;
        console.log(this.productsList)
      })
      this.currentSubs.push(tempSub);
    })

    var today = new Date();

    this.contractWeight = new Weight(0, WeightUnits.Pounds);

    this.contractForm = this.fb.group({
      contractType: ['', Validators.required],
      id: [0, Validators.required],
      client: ['', Validators.required],
      quantity: [, Validators.required],
      quantityUnits: ['', Validators.required],
      product: ['', Validators.required],
      price: [, Validators.required],
      priceUnit: ['', Validators.required],
      marketPrice: [, Validators.required],
      grade: [2, Validators.required],
      aflatoxin: [20, Validators.required],
      deliveryDateStart: [],
      deliveryDateEnd: [],
      paymentTerms: this.fb.group({
        before: [false, Validators.required],
        origin: [false, Validators.required],
        amount: [, Validators.required],
        measurement: ['', Validators.required]
      })
    });

    this.contractForm.get('product').valueChanges.subscribe(val => {
      if(this.contractWeight.unit.name.toLocaleLowerCase() == 'bushels') {
        this.contractWeight.unit.toPounds = this.productsList.find(p => p.name == this.contractForm.getRawValue().product).weight;
      }
    });

    this.contractForm.get('quantity').valueChanges.subscribe(val => {
      this.contractWeight.amount = val;
    });

    this.contractForm.get('quantityUnits').valueChanges.subscribe(val => {
      const tempContractProduct: string = this.contractForm.getRawValue().product;
      if(tempContractProduct) {
        const tempProduct = this.productsList.find(p => p.name == tempContractProduct);
        this.contractWeight.unit = WeightUnits.getUnits(val, tempProduct.weight);
      }
      else {
        this.contractWeight.unit = WeightUnits.getUnits(val);
      }
    });
  }

  ngOnDestroy() {
    for(var x of this.currentSubs) {
      x.unsubscribe();
    }
  }

  compareWithProduct(p1, p2){
    return p1 && p2? p1.name === p2.name: p1 === p2;
  }

  compareWithClient(c1, c2) {
    return c1 && c2? c1.id === c2.id: c1 === c2;
  }

  public getForm() {
    return this.contractForm.getRawValue();
  }

  public submitForm() {
    const formValue = this.contractForm.getRawValue();

    this.db.firestore.runTransaction(transaction => {
      return transaction.get(this.db.firestore.doc(`companies/${this.currentCompany}`)).then(val => {
        var submit = {
          aflatoxin: formValue.aflatoxin,
          base: this.getBushelPrice(formValue.price, formValue.priceUnit, formValue.product) - formValue.marketPrice,
          buyer_terms: "",   //TODO
          client: this.db.doc(`companies/${this.currentCompany}/directory/${formValue.client.id}`).ref,
          clientName: formValue.client.name,
          currentDelivered: 0,
          date: new Date(),
          delivery_dates: {
            begin: new Date(formValue.deliveryDateStart),
            end: new Date(formValue.deliveryDateEnd),
          },
          grade: formValue.grade,
          id: this.currentCompanyValue[formValue.contractType == "purchaseContracts"? "nextPurchaseContract" : "nextSalesContract"],
          loads: 0,
          market_price: formValue.marketPrice,
          paymentTerms: {
            before: formValue.paymentTerms.before,
            measurement: formValue.paymentTerms.measurement,
            origin: formValue.paymentTerms.origin,
            paymentTerms: formValue.paymentTerms.amount
          },
          pricePerBushel: this.getBushelPrice(formValue.price, formValue.priceUnit, formValue.product),
          product: this.db.doc(`companies/${this.currentCompany}/products/${formValue.product.name}`).ref,
          productInfo: {
            moisture: formValue.product.moisture,
            name: formValue.product.name,
            weight: formValue.product.weight
          },
          quantity: this.getPoundWeight(formValue.quantity, formValue.quantityUnits, formValue.product),
          seller_terms: "",     //TODO
          status: "pending",
          tickets: [],
          transport: 'truck',
          truckers: []
        };
    
        var docRef = this.db.firestore.collection(`companies/${this.currentCompany}/${formValue.contractType}`).doc();
  
        transaction.set(docRef, submit);
      })

    }).then(() => {
      this.navController.navigateForward('dashboard/contracts');
    }).catch(error => {
      console.log("Error submitting form: ", error);
    })
  }

  private getBushelPrice(quantity: number, type: string, product: any){
    if(type == "bushel") {
      return quantity;
    }
    if(type == "cwt") {
      return quantity * product.weight / 100;
    }

    return 0;
  }

  private getPoundWeight(quantity: number, type: string, product: any) {
    if(type == "lbs") {
      return quantity;
    } else if(type == "bushels") {
      return quantity * product.weight;
    } else if(type == "cwt") {
      return quantity * 100;
    } else if(type == "trucks") {
      return quantity * 50000
    }

    return 0;
  }

}
