import { Component, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Firestore, addDoc, collection, CollectionReference, doc, docData, DocumentReference } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Observable, Subscription, lastValueFrom } from 'rxjs';
import { WeightUnits } from '@shared/WeightUnits/weight-units';
import { Weight } from '@shared/Weight/weight';
import { MatDialog } from '@angular/material/dialog';
import { SelectClientComponent } from './components/select-client/select-client.component';
import { Contact } from '@shared/classes/contact';
import { Product } from '@shared/classes/product';
import { Company, CompanyContact } from '@shared/classes/company';
import {map, startWith} from 'rxjs/operators';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Plant } from '@shared/classes/plant';
import { Contract } from '@shared/classes/contract';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Mass, units } from '@shared/classes/mass';
import { Price } from '@shared/classes/price';

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
  filteredTruckerOptions: Observable<CompanyContact[]>[] = [];
  contract: Contract;
  chosenProduct: Product;

  useSameClient: boolean = true;
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
    });

    this.contract.aflatoxin = 20;
    this.contract.client = null;
    this.contract.client = null;
    this.contract.clientName = "";
    this.contract.date = new Date();
    this.contract.grade = 2;
    this.contract.id = null;
    this.contract.quantity = new Mass(null, this.session.getDefaultUnit());
    this.contract.type = "";
    this.contract.price = new Price(null, "bu");

    this.contract.delivery_dates = {
      begin: null,
      end: null
    }
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
  }

  compareWithProduct(p1, p2){
    return p1 && p2? p1.name === p2.name: p1 === p2;
  }

  compareWithClient(c1, c2) {
    return c1 && c2? c1.id === c2.id: c1 === c2;
  }

  public submitForm() {
    this.contract.ref = doc(Contract.getCollectionReference(this.db, this.session.getCompany(), this.contract.type)).withConverter(Contract.converter);
    this.contract.set()  
      .then(() => {
        this.navController.navigateForward('dashboard/contracts');
      }).catch(error => {
        this.snack.open(error, "error");
      });
  }

  openClientSelect() {
    const dialogRef = this.dialog.open(SelectClientComponent, {
      width: '600px',
      data: this.contactList
    });


    lastValueFrom(dialogRef.afterClosed()).then(result => {
      if(!result) return;

      Contact.getDoc(this.db, this.session.getCompany(), result[0].id).then(client => {
        this.selectedClient = client;
        this.contract.clientInfo = Contract.clientInfo(client);
        this.contract.clientName = client.name;
      });
    });
  }

  openTicketClientSelect() { 
    const dialogRef = this.dialog.open(SelectClientComponent, {
      width: '600px',
      data: this.contactList
    });

    lastValueFrom(dialogRef.afterClosed()).then(result => {
      Contact.getDoc(this.db, this.session.getCompany(), result[0].id).then(client => {
        this.ticketClient = client;
        this.contract.clientTicketInfo = Contract.clientInfo(client);
        this.contract.clientTicketInfo.name = client.name;
      });
    });
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

  public selectProduct(): void {
    this.contract.product = this.chosenProduct.ref.withConverter(Product.converter);
    this.contract.productInfo = this.chosenProduct.getProductInfo();
    this.contract.quantity.defineBushels(this.chosenProduct);
  }

  public recalculateMass(event: number | units) {
    const params: [number, units] = typeof event === "number" ? 
      [event, this.contract.quantity.defaultUnits] :
      [this.contract.quantity.amount, event];

    this.contract.quantity = new Mass(...params);
    this.contract.quantity.defineBushels(this.contract.productInfo);
  }

}
