import { Component, ContentChild, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company, CompanyContact } from '@shared/classes/company';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { ContractSettings } from '@shared/classes/contract-settings';
import { Mass } from '@shared/classes/mass';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';
import { TypeTemplateDirective } from '@core/directive/type-template/type-template.directive';
import { lastValueFrom } from 'rxjs';
import { SelectClientComponent } from '../select-client/select-client.component';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
})
export class ContractFormComponent implements OnInit {
  @Input() contract: Contract;
  @Output() selectedFieldEvent = new EventEmitter<string>();
  @ContentChild('actionBar') actionBar: TemplateRef<any>;

  public settings$: Promise<ContractSettings>;
  public contactList: CompanyContact[];
  public truckerList: CompanyContact[];
  public products$: Promise<Product[]>;
  public plants$: Promise<Plant[]>;

  public useSameClientForTicket = true;

  @ViewChildren(TypeTemplateDirective) public versionTemplates: QueryList<TypeTemplateDirective>;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.settings$ = ContractSettings.getDocument(this.db, this.session.getCompany());
    this.contract.quantity ??= new Mass(null, null);

    Company.getCompany(this.db, this.session.getCompany()).then(val => {
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

    this.products$ = Product.getProductList(this.db, this.session.getCompany());
    this.plants$ = Plant.getPlantList(this.db, this.session.getCompany());
  }

  openClientSelect() {
    const dialogRef = this.dialog.open(SelectClientComponent, {
      width: '600px',
      data: this.contactList
    });
    this.selectedFieldEvent.emit('client');

    lastValueFrom(dialogRef.afterClosed()).then(result => {
      this.selectedFieldEvent.emit(null);
      if(!result) return;

      Contact.getDoc(this.db, this.session.getCompany(), result[0].id).then(client => {
        this.contract.clientInfo = Contract.clientInfo(client);
        this.contract.clientName = client.name;
        this.contract.client = this.contract.clientInfo.ref.withConverter(Contact.converter);
      });
    });
  }

  openTicketClientSelect() { 
    const dialogRef = this.dialog.open(SelectClientComponent, {
      width: '600px',
      data: this.contactList
    });
    this.selectedFieldEvent.emit('ticketClientInfo');


    lastValueFrom(dialogRef.afterClosed()).then(result => {
      this.selectedFieldEvent.emit(null);
      if(!result) return;

      Contact.getDoc(this.db, this.session.getCompany(), result[0].id).then(client => {
        //this.ticketClient = client;
        this.contract.clientTicketInfo = Contract.clientInfo(client);
        this.contract.clientTicketInfo.name = client.name;
      });
    });
  }

  async docTypeChange() {
    const settings = await this.settings$;
    this.contract.printableFormat = this.contract.type;
    this.contract.tags = settings.contractTags[this.contract.type];

    if(this.contract.tags.includes('sale')) {
      this.contract.bankInfo = settings.defaultBankInfo;
    }
    else {
      this.contract.bankInfo = [];
    }
  }

  async productChange() {
    const product = (await this.products$).find(p => p.ref.id == this.contract.product.id);
    this.contract.productInfo = product.getProductInfo();
    
  }

  async plantSelectChange() {
    const plantList = await this.plants$;
    this.contract.deliveryPlants = [];

    this.contract.plants.forEach(plantId => {
      if(plantId == 'third-party') return;

      const plantObject = plantList.find(plant => plant.ref.id == plantId);
      this.contract.deliveryPlants.push(plantObject.address);
    });

    if(this.contract.plants.includes("third-party")) this.contract.deliveryPlants.push("");
  }

  setMonthAndYear(monthAndYear: Date, datepicker: MatDatepicker<Date>) {
    this.contract.futurePriceInfo.expirationMonth ??= new Date();
    this.contract.futurePriceInfo.expirationMonth = monthAndYear;
    datepicker.close();
  }

  submit(): void {
    console.log(this.contract);
  }

  log(...data: any) : void {
    console.log(...data);
  }
}
