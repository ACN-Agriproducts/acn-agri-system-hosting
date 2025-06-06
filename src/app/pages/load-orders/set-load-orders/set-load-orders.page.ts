import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CompanyService } from '@core/services/company/company.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { CompanyContact } from '@shared/classes/company';
import { Contract } from '@shared/classes/contract';
import { LoadOrder } from '@shared/classes/load-orders.model';
import { ContractsService } from '@shared/model-services/contracts.service';
import { LoadOrderService } from '@shared/model-services/load-order.service';
import { first, map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-set-load-orders',
  templateUrl: './set-load-orders.page.html',
  styleUrls: ['./set-load-orders.page.scss'],
})
export class SetLoadOrdersPage implements OnInit {
  public order: LoadOrder;
  public orders: LoadOrder[];

  plants: string[];
  groupedContracts: Observable<{[type: string]: Contract[]}>;
  contractsList: Observable<Contract[]>;
  selectableTransport: CompanyContact[];

  currentTransportID: string;
  currentTransport: CompanyContact;
  currentContract: Contract;
  currentContractRefId: string;

  public productsList: string[];
  public contactsList: CompanyContact[];
  public sellerControl = new FormControl('');
  public buyerControl = new FormControl('');
  public sellerFilteredContacts: Observable<CompanyContact[]>;
  public buyerFilteredContacts: Observable<CompanyContact[]>;
  public currentCompanyName: string;
  public transportControl = new FormControl('');
  public filteredTransportList: Observable<CompanyContact[]>;
  public loadingNet: number;
  public unloadingNet: number;
  public orderCount: number;

  constructor(
    private loadOrders: LoadOrderService,
    private company: CompanyService,
    private contracts: ContractsService,
    private session: SessionInfo
  ) {}

  ngOnInit() {
    this.order = this.loadOrders.createNew();
    this.order.plants = this.company.getPlantsNamesList();

    console.log(this.order);

    this.plants = this.company.getPlantsNamesList();
    this.groupedContracts = this.contracts.getActiveGrouped();
    this.contractsList = this.contracts.getActive();

    if(this.order.transportRef) {
      this.currentTransport = this.company.getContactsList().find(contact => contact.id == this.order.transportRef.id)
      this.currentTransportID = this.currentTransport.id;
    }

    if(this.order.contractRef) {
      this.currentContractRefId = this.order.contractRef.id;
      this.contractChange();
    }

    this.productsList = this.company.getProductsNamesList();
    this.contactsList = this.company.getContactsList();
    this.sellerControl.setValue(this.order.sellerName);

    this.currentCompanyName = this.company.getCompany().name;
    this.resetSelectableTransport();
    
    this.initObservables();
  }

  async contractChange() {
    this.contractsList.pipe(first()).subscribe(list => {
      this.currentContract = list.find(contract => contract.ref.id == this.currentContractRefId) ?? null;
      this.currentContractRefId = this.currentContract?.ref.id ?? null;

      this.updateSelectableTransportList();

      this.order.contractRef = this.currentContract?.ref.withConverter(Contract.converter) ?? null;
      this.order.clientName = this.currentContract?.clientName ?? null;
      this.order.contractTags = this.currentContract?.tags ?? null;
      this.order.contractID = this.currentContract?.id ?? null;
      this.order.freight.amount = this.currentContract?.default_freight ?? 0;

      this.assignPartyData();
    });
  }

  transportChange() {
    console.log(this.currentTransport, this.order.transportName, this.order.transportRef)
    this.currentTransport = this.selectableTransport.find(contact => contact.id == this.currentTransportID);
    this.order.transportName = this.currentTransport?.name;
    this.order.transportRef = this.currentContract?.truckers.find(trucker => trucker.trucker.id == this.currentTransport?.id)?.trucker;
    console.log(this.currentTransportID, this.currentTransport, this.order.transportName, this.order.transportRef)
  }

  itemName(index: number, item: any) {
    return item.name;
  }

  private _filterContacts(value: string) {
    const filterValue = value.toLowerCase();
    return this.contactsList.filter(contact => contact.name.toLowerCase().includes(filterValue) && !contact.tags.includes('trucker') && (contact.name !== this.order.sellerName || contact.name !== this.order.buyerName));
  }

  private _filterTransports(value: string) {
    const filterValue = value.toLowerCase();
    return this.selectableTransport.filter(contact => contact.name.toLowerCase().includes(filterValue) && contact.tags.includes('trucker'));
  }

  resetSelectableTransport() {
    this.selectableTransport = this.company.getTransportList();
  }

  initObservables() {
    this.sellerFilteredContacts = this.sellerControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterContacts(value || ''))
    );
    this.sellerControl.valueChanges.subscribe(value => this.order.sellerName = value);

    this.buyerFilteredContacts = this.buyerControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterContacts(value || ''))
    );
    this.buyerControl.valueChanges.subscribe(value => this.order.buyerName = value);
  
    this.filteredTransportList = this.transportControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterTransports(value || ''))
    );
    this.transportControl.valueChanges.subscribe(value => this.currentTransportID = value);
  }

  updateSelectableTransportList() {
    this.selectableTransport = this.currentContract ? this.contracts.getContractTransportList(this.currentContract) : [];

    if (!this.currentContract || this.selectableTransport.length === 0) {
      this.resetSelectableTransport();
    }

    this.transportControl.updateValueAndValidity({ onlySelf: false, emitEvent: true });
  }

  updateNet() {
    this.loadingNet = this.order.loadingGross - this.order.loadingTare;
    this.unloadingNet = this.order.unloadingGross - this.order.unloadingTare;
  }

  assignPartyData() {
    if (this.currentContract.type === "sales" || this.currentContract.tags.includes('sales')) {
      this.order.sellerName = this.currentCompanyName;
      this.order.sellerContractId = this.currentContract.id.toString();
      this.order.sellerWarehouse = this.session.getPlant();
      this.order.sellerAddress = this.company.getCompany().address;
      
      this.order.buyerName = this.currentContract.clientName;
      // this.order.buyerContractId
      // this.order.buyerWarehouse
      this.order.buyerAddress = this.currentContract.clientInfo.streetAddress;

      this.sellerControl.setValue(this.order.sellerName);
      this.buyerControl.setValue(this.order.buyerName);
    }
    else if (this.currentContract.type === "purchase" || this.currentContract.tags.includes("purchase")) {
      this.order.buyerName = this.currentCompanyName;
      this.order.buyerContractId = this.currentContract.id.toString();
      this.order.buyerWarehouse = this.session.getPlant();
      this.order.buyerAddress = this.company.getCompany().address;

      this.order.sellerName = this.currentContract.clientName;
      // this.order.buyerContractId
      // this.order.buyerWarehouse
      this.order.sellerAddress = this.currentContract.clientInfo.streetAddress;
    }

    this.order.productName = this.currentContract.productInfo.name;
    this.order.productGrade = this.currentContract.grade;
  }

  testLog(separator: string, ...value: any) {
    console.log("##########  ", separator ?? "", "  ##########")
    console.log(value)
  }
}
