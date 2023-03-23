import { Component, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Firestore, addDoc, collection, CollectionReference, doc, docData } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Observable, Subscription, lastValueFrom } from 'rxjs';
import { WeightUnits } from '@shared/WeightUnits/weight-units';
import { Weight } from '@shared/Weight/weight';
import { MatDialog } from '@angular/material/dialog';
import { Contact } from '@shared/classes/contact';
import { Product } from '@shared/classes/product';
import { Company, CompanyContact } from '@shared/classes/company';
import {map, startWith} from 'rxjs/operators';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Plant } from '@shared/classes/plant';
import { Contract } from '@shared/classes/contract';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Mass } from '@shared/classes/mass';

@Component({
  selector: 'app-new-contract',
  templateUrl: './new-contract.page.html',
  styleUrls: ['./new-contract.page.scss'],
})
export class NewContractPage implements OnInit {
  formControl = FormControl
  formGroup = FormGroup

  currentCompanyValue: Company;
  contactList: CompanyContact[];
  truckerList: CompanyContact[];
  productsList: Product[];
  plantsList: Plant[];
  contractWeight: Mass;
  filteredTruckerOptions: Observable<CompanyContact[]>[] = [];
  contract: Contract;

  useSameClient: boolean = true;
  price: number;
  priceUnit: string;
  truckerArray: FormArray;
  formIsValid: boolean = false;
  idIsValid: boolean = false;
  
  selectedClient: Contact;
  ticketClient: Contact;

  contractTypeList: Map<string, string>;

  constructor(
    private db: Firestore,
    private dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private navController: NavController,
    private session: SessionInfo,
    private snack: SnackbarService,
  ) { }

  ngOnInit() {
    this.contract = new Contract(doc(Contract.getCollectionReference(this.db, this.session.getCompany(), "")))

    Plant.getPlantList(this.db, this.session.getCompany()).then(list => {
      this.plantsList = list;
      this.contract.plants = [...list.map(p => p.snapshot.id)];
    });

    Company.getCompany(this.db, this.session.getCompany()).then(val => {
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
    });

    Product.getProductList(this.db, this.session.getCompany()).then(list => {
      this.productsList = list;
      this.contract.productInfo = list[0].getProductInfo();
      this.contract.product = list[0].ref.withConverter(Product.converter);
    });

    this.contractWeight = new Mass(0, this.session.getDefaultUnit());

    this.contract.date = new Date();
    this.contract.type = "";
    this.contract.id = null;
    this.contract.clientName = "";
    this.contract.client = null;
    this.contract.client = null;
    this.contract.quantity = new Mass(0, this.session.getDefaultUnit());
    this.contract.market_price
    this.contract.grade
    this.contract.aflatoxin
    this.contract.delivery_dates = {
      begin: null,
      end: null
    }
    this.contract.plants
    this.contract.paymentTerms = {
      before: false,
      origin: false,
      paymentTerms: null, 
      measurement: null
    }
    this.contract.clientTicketInfo = {
      caat: null,
      city: null,
      email: null,
      name: null,
      phoneNumber: null,
      state: null,
      streetAddress: null,
      zipCode: null,
      ref: null
    }
    this.contract.truckers = [];

    this.truckerArray = this.fb.array([]);

    // this.contractForm.get('product').valueChanges.subscribe((newProduct: Product) => {
    //   if(this.contractForm.get('quantityUnits').value == 'bushels') {
    //     const oldProduct = this.contractForm.value.product as Product;
    //     this.contractWeight.amount = this.contractWeight.amount / oldProduct.weight * newProduct.weight;
    //   }
    // });

    // this.contractForm.get('quantity').valueChanges.subscribe(val => {
    //   if(this.contractForm.get('quantityUnits').value == 'bushels') {
    //     const product = this.contractForm.value.product as Product;
    //     val = val * product.weight;
    //   }
    //   this.contractWeight.amount = val;
    // });

    // this.contractForm.get('quantityUnits').valueChanges.subscribe(val => {
    //   const form = this.contractForm.value
    //   const product = form.product as Product;

    //   if(val == 'bushels') {
    //     this.contractWeight.amount = form.quantity * product.weight;
    //     this.contractWeight.defaultUnits = 'lbs';
    //   }
    //   else if(form.quantityUnits == 'bushels') {
    //     this.contractWeight.amount = form.quantity;
    //     this.contractWeight.defaultUnits = val;
    //   }
    //   else {
    //     this.contractWeight.defaultUnits = val;
    //   }
    // });
  }

  compareWithProduct(p1, p2){
    return p1 && p2? p1.name === p2.name: p1 === p2;
  }

  compareWithClient(c1, c2) {
    return c1 && c2? c1.id === c2.id: c1 === c2;
  }

  // public getForm() {
  //   let form = this.contractForm.getRawValue();
  //   form.client = this.selectedClient;
  //   return form;
  // }

  public submitForm() {
    // const formValue = this.contractForm.getRawValue();
    // if(formValue.useSameClient) {
    //   this.ticketClient = this.selectedClient;
    // }

    // var submit = {
    //   aflatoxin: formValue.aflatoxin,
    //   base: this.getBushelPrice() - formValue.market_price,
    //   client: this.selectedClient.ref,
    //   clientInfo: {
    //     caat: this.selectedClient.caat,
    //     city: this.selectedClient.city,
    //     email: this.selectedClient.email,
    //     name: this.selectedClient.name,
    //     phoneNumber: this.selectedClient.phoneNumber,
    //     state: this.selectedClient.state,
    //     streetAddress: this.selectedClient.streetAddress,
    //     type: this.selectedClient.type,
    //     zipCode: this.selectedClient.zipCode
    //   },
    //   clientName: formValue.client,
    //   clientTicketInfo: {
    //     caat: this.ticketClient.caat,
    //     city: this.ticketClient.city,
    //     email: this.ticketClient.email,
    //     name: this.ticketClient.name,
    //     phoneNumber: this.ticketClient.phoneNumber,
    //     state: this.ticketClient.state,
    //     streetAddress: this.ticketClient.streetAddress,
    //     type: this.ticketClient.type,
    //     zipCode: this.ticketClient.zipCode,
    //     ref: this.ticketClient.ref
    //   },
    //   currentDelivered: 0,
    //   date: new Date(),
    //   delivery_dates: {
    //     begin: new Date(formValue.deliveryDateStart),
    //     end: new Date(formValue.deliveryDateEnd),
    //   },
    //   grade: formValue.grade,
    //   id: formValue.id,
    //   loads: 0,
    //   market_price: formValue.market_price,
    //   paymentTerms: {
    //     before: formValue.paymentTerms.before,
    //     measurement: formValue.paymentTerms.measurement,
    //     origin: formValue.paymentTerms.origin,
    //     paymentTerms: formValue.paymentTerms.paymentTerms
    //   },
    //   plants: formValue.plants.map(p => p.ref.id),
    //   pricePerBushel: this.getBushelPrice(),
    //   product: formValue.product.ref,
    //   productInfo: {
    //     moisture: formValue.product.moisture,
    //     name: formValue.product.ref.id,
    //     weight: formValue.product.weight
    //   },
    //   quantity: this.contractWeight.getMassInUnit(this.session.getDefaultUnit()),
    //   status: "pending",
    //   tickets: [],
    //   transport: 'truck',
    //   truckers: formValue.truckers.map(t => {
    //     t.trucker = Contact.getDocReference(this.db, this.currentCompany, this.truckerList.find(trucker => trucker.name == t.trucker).id);
    //     return t;
    //   })
    // };
    
    this.contract.ref = doc(Contract.getCollectionReference(this.db, this.session.getCompany(), this.contract.type)).withConverter(Contract.converter);
    this.contract.set()  
      .then(() => {
        this.navController.navigateForward('dashboard/contracts');
      }).catch(error => {
        this.snack.open(error, "error");
      });
  }

  private getBushelPrice(): number{
    const product = this.productsList.find(p => p.ref.id == this.contract.product.id);

    if(this.priceUnit == 'bushels'){
      return this.price;
    }
    if(this.priceUnit == 'lbs'){
      return this.price * product.weight;
    }
    if(this.priceUnit == 'CWT'){
      return this.price / 100 * product.weight;
    }
    if(this.priceUnit == 'mTon'){
      return this.price / 2204.6 * product.weight;
    }

    return 0;
  }

  openClientSelect() {
    // const dialogRef = this.dialog.open(SelectClientComponent, {
    //   width: '600px',
    //   data: this.contactList
    // });


    // lastValueFrom(dialogRef.afterClosed()).then(result => {
    //   if(!result) return;

    //   Contact.getDoc(this.db, this.session.getCompany(), result[0].id).then(client => {
    //     this.selectedClient = client;
    //     this.contract.clientInfo = Contract.clientInfo(client);
    //     this.contract.clientName = client.name;
    //   });
    // });
  }

  openTicketClientSelect() { 
    // const dialogRef = this.dialog.open(SelectClientComponent, {
    //   width: '600px',
    //   data: this.contactList
    // });

    // lastValueFrom(dialogRef.afterClosed()).then(result => {
    //   Contact.getDoc(this.db, this.session.getCompany(), result[0].id).then(client => {
    //     this.ticketClient = client;
    //     this.contract.clientTicketInfo = Contract.clientInfo(client);
    //     this.contract.clientTicketInfo.name = client.name;
    //   });
    // });
  }

  addPlantChip(plant: string): void {
    const chosenPlants = this.contract.plants;

    if(!this.chipIsChosen(plant)) {
      chosenPlants.push(plant);
    }
  }

  removePlantChip(plant: string) {
    const chosenPlants = this.contract.plants as string[];
    const index: number = chosenPlants.indexOf(plant);

    if(index >= 0) {
      chosenPlants.splice(index, 1);
    }
  }

  chipIsChosen(plant: string) {
    const chosenPlants = this.contract.plants as string[];
    return chosenPlants.findIndex(p => p == plant) != -1;
  }

  private newTruckerGroup(): UntypedFormGroup {
    return this.fb.group({
      trucker: [,Validators.required],
      freight: [,Validators.required]
    });
  }

  addTruckerGroup(): void {
    this.truckerArray.push(this.newTruckerGroup());
    this.filteredTruckerOptions.push(this.truckerArray.get([this.truckerArray.length-1, 'trucker']).valueChanges.pipe(
      startWith(''), map(value => this._filter(value || ''))
    ));
  }

  removeTruckerGroup(index: number): void {
    this.truckerArray.removeAt(index);
    this.filteredTruckerOptions.splice(index, 1);
  }

  contractTypeChange() {}

  _filter(value: string): CompanyContact[] {
    const filterValue = value.toLowerCase();
    return this.truckerList.filter(trucker => (trucker.name as string).toLowerCase().includes(filterValue));
  }

  contractTypeGetter(): string {
    return this.contract.type ?? "";
  }
}
