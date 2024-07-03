import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractPaymentReportsPageRoutingModule } from './contract-payment-reports-routing.module';

import { ContractPaymentReportsPage } from './contract-payment-reports.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContractPaymentReportsPageRoutingModule
  ],
  declarations: [ContractPaymentReportsPage]
})
export class ContractPaymentReportsPageModule {}
