import { Component, OnDestroy, OnInit } from '@angular/core';
import { Firestore, addDoc, collection, CollectionReference, doc, docData } from '@angular/fire/firestore';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { WeightUnits } from '@shared/WeightUnits/weight-units';
import { Weight } from '@shared/Weight/weight';
import {MatDialog} from '@angular/material/dialog';
import { SelectClientComponent } from './components/select-client/select-client.component';
import { UniqueContractId } from './components/unique-contract-id';
import { Contact } from '@shared/classes/contact';
import { Product } from '@shared/classes/product';
import { Company, CompanyContact } from '@shared/classes/company';
import {map, startWith} from 'rxjs/operators';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Plant } from '@shared/classes/plant';
import { Mass } from '@shared/classes/mass';

@Component({
  selector: 'app-new-contract',
  templateUrl: './new-contract.page.html',
  styleUrls: ['./new-contract.page.scss'],
})
export class NewContractPage implements OnInit, OnDestroy {
  currentCompany: string;
  currentCompanyValue: Company;
  contactList: CompanyContact[];
  truckerList: CompanyContact[];
  productsList: Product[];
  plantsList: Plant[];
  clientsReady: boolean = false;
  productsReady: boolean = false;
  contractForm: UntypedFormGroup;
  currentSubs: Subscription[] = [];
  contractWeight: Mass;
  filteredTruckerOptions: Observable<CompanyContact[]>[] = [];
  
  selectedClient: Contact;
  ticketClient: Contact;

  constructor(
    private fb: UntypedFormBuilder,
    private db: Firestore,
    private navController: NavController,
    private dialog: MatDialog,
    private uniqueId: UniqueContractId,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();

    Plant.getPlantList(this.db, this.currentCompany).then(list => {
      this.plantsList = list;
      if(this.contractForm) {
        this.contractForm.get('plants').setValue([...list]);
      }
    });

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

    this.contractWeight = new Mass(0, this.session.getDefaultUnit());

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
      plants: [[], Validators.required],
      paymentTerms: this.fb.group({
        before: [false],
        origin: [false],
        paymentTerms: [],
        measurement: []
      }),
      ticketClient: [{value: '', disabled: true}],
      truckers: this.fb.array([])
    }, { validators: form => Validators.required(form.get('client')) });

    this.contractForm.get('product').valueChanges.subscribe((newProduct: Product) => {
      if(this.contractForm.get('quantityUnits').value == 'bushels') {
        const oldProduct = this.contractForm.value.product as Product;
        this.contractWeight.amount = this.contractWeight.amount / oldProduct.weight * newProduct.weight;
      }
    });

    this.contractForm.get('quantity').valueChanges.subscribe(val => {
      if(this.contractForm.get('quantityUnits').value == 'bushels') {
        const product = this.contractForm.value.product as Product;
        val = val * product.weight;
      }
      this.contractWeight.amount = val;
    });

    this.contractForm.get('quantityUnits').valueChanges.subscribe(val => {
      const form = this.contractForm.value
      const product = form.product as Product;

      if(val == 'bushels') {
        this.contractWeight.amount = form.quantity * product.weight;
        this.contractWeight.defaultUnits = 'lbs';
      }
      else {
        this.contractWeight.defaultUnits = val;
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
      plants: formValue.plants.map(p => p.ref.id),
      pricePerBushel: this.getBushelPrice(),
      product: formValue.product.ref,
      productInfo: {
        moisture: formValue.product.moisture,
        name: formValue.product.ref.id,
        weight: formValue.product.weight
      },
      quantity: this.contractWeight.getMassInUnit(this.session.getDefaultUnit()),
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
    if(form.priceUnit == 'mTon'){
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

  addPlantChip(plant: Plant): void {
    const chosenPlants = this.contractForm.get('plants').value as Plant[];

    if(!this.chipIsChosen(plant)) {
      chosenPlants.push(plant);
      this.contractForm.get('plants').setValue(chosenPlants);
    }
  }

  removePlantChip(plant: Plant) {
    const chosenPlants = this.contractForm.get('plants').value as Plant[];
    const index: number = chosenPlants.indexOf(plant);

    if(index >= 0) {
      chosenPlants.splice(index, 1);
      this.contractForm.get('plants').setValue(chosenPlants);
    }
  }

  chipIsChosen(plant: Plant) {
    const chosenPlants = this.contractForm.get('plants').value as Plant[];
    return chosenPlants.findIndex(p => p.ref.id == plant.ref.id) != -1;
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

  _filter(value: string): CompanyContact[] {
    const filterValue = value.toLowerCase();
    return this.truckerList.filter(trucker => (trucker.name as string).toLowerCase().includes(filterValue));
  }
}
