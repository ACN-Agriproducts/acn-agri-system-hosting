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
  activeContracts: Observable<{[type: string]: Contract[]}>;
  selectableTransport: CompanyContact[];

  currentTransport: CompanyContact;
  currentContract: Contract;

  constructor(
    @Inject(MAT_DIALOG_DATA) public order: LoadOrder,
    private company: CompanyService,
    private contracts: ContractsService 
  ) { }

  ngOnInit() {
    this.plants = this.company.getPlantsList().map(p => p.ref.id);
    this.activeContracts = this.contracts.getActiveGrouped();
    if(this.order.transportRef) this.currentTransport = this.company.getContactsList().find(contact => contact.id == this.order.transportRef.id);
    if(this.order.contractRef) this.activeContracts.pipe(first()).subscribe(groups => {
      // Ew #TODO: SOME VALUES ARE NOT LOADED CORRECTLY FOR SETTING
      const temp = Object.values(groups).reduce((prev, curr) => {prev.push(...curr); return prev}, []).find(contract => contract.ref.id == this.order.contractRef.id);
      console.log(temp);
      this.currentContract = temp;
    });
  }

  contractChange() {
    this.selectableTransport = this.company.getContactsList().filter(contact => this.currentContract.truckers.some(trucker => trucker.trucker.id == contact.id));
    this.order.contractRef = this.currentContract.ref.withConverter(Contract.converter);
    this.order.clientName = this.currentContract.clientName;
    this.order.contractTags = this.currentContract.tags;
    this.order.contractID = this.currentContract.id;
  }

  transportChange() {
    this.order.transportName = this.currentTransport.name;
    this.order.transportRef = this.currentContract.truckers.find(trucker => trucker.trucker.id == this.currentTransport.id).trucker;
  }
}
