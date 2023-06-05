import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { NewContractPageRoutingModule } from './new-contract-routing.module';
import { DisplayContractComponent } from './components/display-contract/display-contract.component';

import { NewContractPage } from './new-contract.page';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { NgxPrintModule } from 'ngx-print';
import { UniqueIdValidatorDirective } from './components/unique-id-validator.directive';
import { ContractModule } from './../../../modules/contract/contract.module';
import { ContractPrintablesModule } from 'src/app/modules/contract-printables/contract-printables.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewContractPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    SharedModule,
    NgxPrintModule,
    ContractModule,
    ContractPrintablesModule
  ],
  declarations: [NewContractPage, DisplayContractComponent, UniqueIdValidatorDirective],
})
export class NewContractPageModule {}
