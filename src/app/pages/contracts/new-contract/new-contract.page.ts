import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, CollectionReference } from '@angular/fire/compat/firestore';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { WeightUnits } from '@shared/WeightUnits/weight-units';
import { Weight } from '@shared/Weight/weight';
import {MatDialog} from '@angular/material/dialog';
import { SelectClientComponent } from './components/select-client/select-client.component';
import { UniqueContractId } from './components/unique-contract-id';
import { Contact } from '@shared/classes/contact';
import { Product } from '@shared/classes/product';

@Component({
  selector: 'app-new-contract',
  templateUrl: './new-contract.page.html',
  styleUrls: ['./new-contract.page.scss'],
})
export class NewContractPage implements OnInit, OnDestroy {
  currentCompany: string;
  currentCompanyValue: any;
  contactList: any[];
  productsList: Product[];
  clientsReady: boolean = false;
  productsReady: boolean = false;
  contractForm: FormGroup;
  currentSubs: Subscription[] = [];
  contractWeight: Weight;
  
  selectedClient: Contact;
  ticketClient: Contact;

  constructor(
    private fb: FormBuilder,
    private db: AngularFirestore,
    private localStorage: Storage,
    private navController: NavController,
    private dialog: MatDialog,
    private uniqueId: UniqueContractId
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany').then(val =>{
      this.currentCompany = val;

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

      Product.getProductList(this.db, this.currentCompany).then(list => {
        this.productsList = list
      });
    })

    var today = new Date();

    this.contractWeight = new Weight(0, WeightUnits.Pounds);

    this.uniqueId.setGetterFunction(this.getContractCollection.bind(this));

    this.contractForm = this.fb.group({
      contractType: ['', Validators.required],
      id: [{value: null, disabled: true}, [Validators.required], this.uniqueId.validate.bind(this.uniqueId)],
      client: [{value:'', disabled: true}, Validators.required],
      quantity: [, Validators.required],
      quantityUnits: ['', Validators.required],
      product: ['', Validators.required],
      price: [, Validators.required],
      priceUnit: ['', Validators.required],
      market_price: [],
      grade: [2, Validators.required],
      aflatoxin: [20, Validators.required],
      deliveryDateStart: [],
      deliveryDateEnd: [],
      useSameClient: [true],
      paymentTerms: this.fb.group({
        before: [false],
        origin: [false],
        paymentTerms: [],
        measurement: []
      }),
      ticketClient: [{value: '', disabled: true}],
    }, { validators: form => Validators.required(form.get('client')) });

    this.contractForm.get('product').valueChanges.subscribe(val => {
      if(this.contractWeight.unit.name.toLocaleLowerCase() == 'bushels') {
        this.contractWeight.unit.toPounds = val.weight;
      }
    });

    this.contractForm.get('quantity').valueChanges.subscribe(val => {
      this.contractWeight.amount = val;
    });

    this.contractForm.get('quantityUnits').valueChanges.subscribe(val => {
      this.contractWeight.unit = WeightUnits.getUnits(val);
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
    let form = this.contractForm.getRawValue();
    form.client = this.selectedClient;
    return form;
  }

  public submitForm() {
    const formValue = this.contractForm.getRawValue();
    if(formValue.useSameClient) {
      this.ticketClient = this.selectedClient;
    }

    this.db.firestore.runTransaction(transaction => {
      return transaction.get(this.db.firestore.doc(`companies/${this.currentCompany}`)).then(val => {
        var submit = {
          aflatoxin: formValue.aflatoxin,
          base: this.getBushelPrice() - formValue.market_price,
          buyer_terms: "",   //TODO
          client: this.selectedClient.ref,
          clientInfo: {
            caat: this.selectedClient.caat,
            city: this.selectedClient.city,
            email: this.selectedClient.email,
            name: this.selectedClient.name,
            phoneNumber: this.selectedClient.phoneNumber,
            state: this.selectedClient.state,
            streetAddress: this.selectedClient.streetAddress,
            type: this.selectedClient.type,
            zipCode: this.selectedClient.zipCode
          },
          clientName: formValue.client,
          clientTicketInfo: {
            caat: this.ticketClient.caat,
            city: this.ticketClient.city,
            email: this.ticketClient.email,
            name: this.ticketClient.name,
            phoneNumber: this.ticketClient.phoneNumber,
            state: this.ticketClient.state,
            streetAddress: this.ticketClient.streetAddress,
            type: this.ticketClient.type,
            zipCode: this.ticketClient.zipCode,
            ref: this.ticketClient.ref
          },
          currentDelivered: 0,
          date: new Date(),
          delivery_dates: {
            begin: new Date(formValue.deliveryDateStart),
            end: new Date(formValue.deliveryDateEnd),
          },
          grade: formValue.grade,
          id: formValue.id,
          loads: 0,
          market_price: formValue.market_price,
          paymentTerms: {
            before: formValue.paymentTerms.before,
            measurement: formValue.paymentTerms.measurement,
            origin: formValue.paymentTerms.origin,
            paymentTerms: formValue.paymentTerms.paymentTerms
          },
          pricePerBushel: this.getBushelPrice(),
          product: this.db.doc(`companies/${this.currentCompany}/products/${formValue.product.name}`).ref,
          productInfo: {
            moisture: formValue.product.moisture,
            name: formValue.product.ref.id,
            weight: formValue.product.weight
          },
          quantity: this.contractWeight.getPounds(),
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

  private getBushelPrice(): number{
    const form = this.contractForm.getRawValue();
    const price = form.price;
    
    if(form.priceUnit == 'bushels'){
      return price;
    }
    if(form.priceUnit == 'lbs'){
      return price * form.product.weight;
    }
    if(form.priceUnit == 'CWT'){
      return price / 100 * form.product.weight;
    }
    if(form.priceUnit == 'mtons'){
      return price / 2204.6 * form.product.weight;
    }

    return 0;
  }

  openClientSelect() {
    const dialogRef = this.dialog.open(SelectClientComponent, {
      width: '600px',
      data: this.contactList
    });

    dialogRef.afterClosed().subscribe(result => {
      Contact.getDoc(this.db, this.currentCompany, result[0].id).then(client => {
        this.selectedClient = client;
        this.contractForm.controls['client'].setValue(client.name);
      });
    });
  }

  openTicketClientSelect() { 
    const dialogRef = this.dialog.open(SelectClientComponent, {
      width: '600px',
      data: this.contactList
    });

    dialogRef.afterClosed().subscribe(result => {
      Contact.getDoc(this.db, this.currentCompany, result[0].id).then(client => {
        this.ticketClient = client;
        this.contractForm.controls['ticketClient'].setValue(client.name);
      });
    });
  }

  contractTypeChange() {
    this.contractForm.get('id').enable();
  }

  getContractCollection(): AngularFirestoreCollection {
    const contractTypeControl = this.contractForm.get('contractType') as FormControl;
    return this.db.collection(`companies/${this.currentCompany}/${contractTypeControl.value}`);
  }
}
