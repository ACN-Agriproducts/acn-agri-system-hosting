import { Component, OnDestroy, OnInit } from '@angular/core';
import { Firestore, addDoc, collection, CollectionReference, doc, docData } from '@angular/fire/firestore';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Observable, Subscription } from 'rxjs';
import { WeightUnits } from '@shared/WeightUnits/weight-units';
import { Weight } from '@shared/Weight/weight';
import {MatDialog} from '@angular/material/dialog';
import { SelectClientComponent } from './components/select-client/select-client.component';
import { UniqueContractId } from './components/unique-contract-id';
import { Contact } from '@shared/classes/contact';
import { Product } from '@shared/classes/product';
import { Company } from '@shared/classes/company';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-new-contract',
  templateUrl: './new-contract.page.html',
  styleUrls: ['./new-contract.page.scss'],
})
export class NewContractPage implements OnInit, OnDestroy {
  currentCompany: string;
  currentCompanyValue: Company;
  contactList: any[];
  truckerList: any[];
  productsList: Product[];
  clientsReady: boolean = false;
  productsReady: boolean = false;
  contractForm: UntypedFormGroup;
  currentSubs: Subscription[] = [];
  contractWeight: Weight;
  filteredTruckerOptions: Observable<string[]>[] = [];
  
  selectedClient: Contact;
  ticketClient: Contact;

  constructor(
    private fb: UntypedFormBuilder,
    private db: Firestore,
    private localStorage: Storage,
    private navController: NavController,
    private dialog: MatDialog,
    private uniqueId: UniqueContractId
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany').then(val =>{
      this.currentCompany = val;

      var tempSub = docData(Company.getCompanyRef(this.db, this.currentCompany)).subscribe(val => {
        this.currentCompanyValue = val;
        this.contactList = val.contactList.sort((a, b) =>{
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
        this.truckerList = this.contactList.filter(c => !c.isClient);
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
      truckers: this.fb.array([])
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
      product: formValue.product.ref,
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
      truckers: formValue.truckers.map(t => {
        t.trucker = Contact.getDocReference(this.db, this.currentCompany, this.truckerList.find(trucker => trucker.name == t.trucker).id);
        return t;
      })
    };
    
    addDoc(this.getContractCollection(), submit)
      .then(() => {
        this.navController.navigateForward('dashboard/contracts');
      }).catch(error => {
        console.log("Error submitting form: ", error);
      });
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

  getContractCollection(): CollectionReference {
    const contractTypeControl = this.contractForm.get('contractType') as UntypedFormControl;
    return collection(this.currentCompanyValue.ref, contractTypeControl.value);
  }

  private newTruckerGroup(): UntypedFormGroup {
    return this.fb.group({
      trucker: [,Validators.required],
      freight: [,Validators.required]
    });
  }

  addTruckerGroup(): void {
    const truckers = this.contractForm.get('truckers') as UntypedFormArray;
    truckers.push(this.newTruckerGroup());
    this.filteredTruckerOptions.push(truckers.get([truckers.length-1, 'trucker']).valueChanges.pipe(
      startWith(''), map(value => this._filter(value || ''))
    ));
  }

  removeTruckerGroup(index: number): void {
    const truckers = this.contractForm.get('truckers') as UntypedFormArray;
    truckers.removeAt(index);
    this.filteredTruckerOptions.splice(index, 1);
  }

  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.truckerList.filter(trucker => (trucker.name as string).toLowerCase().includes(filterValue));
  }
}
