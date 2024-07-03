import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractPaymentReportsPageRoutingModule } from './contract-payment-reports-routing.module';

import { ContractPaymentReportsPage } from './contract-payment-reports.page';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    IonicModule,
    ContractPaymentReportsPageRoutingModule,
    SharedModule
  ],
  declarations: [ContractPaymentReportsPage]
})
export class ContractPaymentReportsPageModule {}
