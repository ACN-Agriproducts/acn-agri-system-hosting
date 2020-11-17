import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractsPageRoutingModule } from './contracts-routing.module';

import { ContractsPage } from './contracts.page';
import { ContractModalComponent } from './components/contract-modal/contract-modal.component';
import { OptionsContractComponent } from './components/options-contract/options-contract.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContractsPageRoutingModule,
    CoreModule
  ],
  declarations: [ContractsPage, ContractModalComponent, OptionsContractComponent]
})
export class ContractsPageModule {}
