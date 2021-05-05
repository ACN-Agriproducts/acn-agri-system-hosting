import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { NewContractPageRoutingModule } from './new-contract-routing.module';

import { NewContractPage } from './new-contract.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewContractPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [NewContractPage]
})
export class NewContractPageModule {}
