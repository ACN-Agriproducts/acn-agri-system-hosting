import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractInfoPageRoutingModule } from './contract-info-routing.module';

import { ContractInfoPage } from './contract-info.page';
import { CoreModule } from '@core/core.module';
import { TicketsTableComponent } from './components/tickets-table/tickets-table.component';
import { TruckerTableComponent } from './components/trucker-table/trucker-table.component';
import { ContractLiquidationLongComponent } from './components/contract-liquidation-long/contract-liquidation-long.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContractInfoPageRoutingModule,
    CoreModule
  ],
  declarations: [
    ContractInfoPage,
    TicketsTableComponent,
    TruckerTableComponent,
    ContractLiquidationLongComponent
  ]
})
export class ContractInfoPageModule {}
