import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompanyService } from '@core/services/company/company.service';
import { CompanyContact } from '@shared/classes/company';
import { Contract } from '@shared/classes/contract';
import { LoadOrder } from '@shared/classes/load-orders.model';
import { ContractsService } from '@shared/model-services/contracts.service';
import { first, lastValueFrom, Observable } from 'rxjs';

@Component({
  selector: 'app-set-order-modal',
  templateUrl: './set-order-modal.component.html',
  styleUrls: ['./set-order-modal.component.scss'],
})
export class SetOrderModalComponent implements OnInit {
  plants: string[];
  groupedContracts: Observable<{[type: string]: Contract[]}>;
  contractsList: Observable<Contract[]>;
  selectableTransport: CompanyContact[];

  currentTransportID: string;
  currentTransport: CompanyContact;
  currentContract: Contract;
  currentContractID: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public order: LoadOrder,
    private company: CompanyService,
    private contracts: ContractsService 
  ) { }

  ngOnInit() {
    console.log(this.order);

    this.plants = this.company.getPlantsNamesList();
    this.groupedContracts = this.contracts.getActiveGrouped();
    this.contractsList = this.contracts.getActive();
    if(this.order.transportRef) {
      this.currentTransport = this.company.getContactsList().find(contact => contact.id == this.order.transportRef.id)
      this.currentTransportID = this.currentTransport.id;
    };
    if(this.order.contractRef) {
      this.currentContractID = this.order.contractRef.id;
      this.contractChange();
    }
  }

  async contractChange() {
    this.contractsList.pipe(first()).subscribe(list => {
      this.currentContract = list.find(contract => contract.ref.id == this.currentContractID);
      this.currentContractID = this.currentContract.ref.id;
      this.selectableTransport = this.contracts.getContractTransportList(this.currentContract);
      this.order.contractRef = this.currentContract.ref.withConverter(Contract.converter);
      this.order.clientName = this.currentContract.clientName;
      this.order.contractTags = this.currentContract.tags;
      this.order.contractID = this.currentContract.id;
      this.order.freight.amount = this.currentContract.default_freight;
    });
  }

  transportChange() {
    this.currentTransport = this.selectableTransport.find(contact => contact.id == this.currentTransportID)
    console.log(this.currentTransportID, this.currentTransport);
    this.order.transportName = this.currentTransport.name;
    this.order.transportRef = this.currentContract.truckers.find(trucker => trucker.trucker.id == this.currentTransport.id).trucker;
  }
}
