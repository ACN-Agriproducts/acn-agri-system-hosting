import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-new-contract',
  templateUrl: './new-contract.page.html',
  styleUrls: ['./new-contract.page.scss'],
})
export class NewContractPage implements OnInit {

  currentCompany: string;
  currentCompanyValue: any;
  contactList: any[];
  productsList: any[];
  clientsReady: boolean = false;
  productsReady: boolean = false;
  contractForm: FormGroup;

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

      this.db.doc(`companies/${this.currentCompany}`).valueChanges().subscribe(val => {
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

      this.db.collection(`companies/${this.currentCompany}/products`).valueChanges({idField: 'name'}).subscribe(val => {
        this.productsList = val;
        this.productsReady = true;
      })
    })

    var today = new Date();

    this.contractForm = this.fb.group({
      contractType: ['', Validators.required],
      client: ['', Validators.required],
      quantity: [0, Validators.required],
      quantityUnits: ['', Validators.required],
      product: ['', Validators.required],
      price: [0, Validators.required],
      priceUnit: ['', Validators.required],
      marketPrice: [0, Validators.required],
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
    })
  }

  compareWithProduct(p1, p2){
    return p1 && p2? p1.name === p2.name: p1 === p2;
  }

  compareWithClient(c1, c2) {
    return c1 && c2? c1.id === c2.id: c1 === c2;
  }

  public submitForm() {
    const formValue = this.contractForm.getRawValue();

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

    this.db.collection(`companies/${this.currentCompany}/${formValue.contractType}`).add(Object.assign({}, submit));
    this.navController.navigateForward('dashboard/contracts');
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
