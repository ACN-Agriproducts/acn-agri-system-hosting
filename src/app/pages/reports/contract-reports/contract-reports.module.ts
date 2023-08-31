import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractReportsPageRoutingModule } from './contract-reports-routing.module';

import { ContractReportsPage } from './contract-reports.page';
import { CoreModule } from '@core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContractReportsPageRoutingModule,
    CoreModule
  ],
  declarations: [ContractReportsPage]
})
export class ContractReportsPageModule {}
