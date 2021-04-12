import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractsPageRoutingModule } from './contracts-routing.module';

import { ContractsPage } from './contracts.page';
import { ContractModalComponent } from './components/contract-modal/contract-modal.component';
import { OptionsContractComponent } from './components/options-contract/options-contract.component';
import { ShowDetailsComponent } from './components/show-details/show-details.component';
import { OptionFilterComponent } from './components/option-filter/option-filter.component';
import { FilterComponent } from './components/filter/filter.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ContractsPageRoutingModule,
    CoreModule
  ],
  declarations: [
    ContractsPage,
    ContractModalComponent,
    OptionsContractComponent,
    ShowDetailsComponent,
    OptionFilterComponent,
    FilterComponent
  ]
})
export class ContractsPageModule { }
