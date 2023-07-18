import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractInfoPageRoutingModule } from './contract-info-routing.module';

import { ContractInfoPage } from './contract-info.page';
import { CoreModule } from '@core/core.module';
import { TicketsTableComponent } from './components/tickets-table/tickets-table.component';
import { TruckerTableComponent } from './components/trucker-table/trucker-table.component';
import { ContractLiquidationLongComponent, DiscountsPipe } from './components/contract-liquidation-long/contract-liquidation-long.component';
import { NgxPrintModule } from 'ngx-print';
import { DisplayContractComponent } from './components/display-contract/display-contract.component';
import { SharedModule } from '@shared/shared.module';
import { TicketDiscountTableComponent } from './components/ticket-discount-table/ticket-discount-table.component';
import { TruckersFormComponent } from './components/truckers-form/truckers-form.component';
import { ContractModule } from 'src/app/modules/contract/contract.module';
import { ContractPrintablesModule } from 'src/app/modules/contract-printables/contract-printables.module';
import { ContractLiquidationsComponent } from './components/contract-liquidations/contract-liquidations.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContractInfoPageRoutingModule,
    CoreModule,
    NgxPrintModule,
    SharedModule,
    ReactiveFormsModule,
    ContractModule,
    ContractPrintablesModule,
  ],
  declarations: [
    ContractInfoPage,
    TicketsTableComponent,
    TruckerTableComponent,
    ContractLiquidationLongComponent,
    DisplayContractComponent,
    TicketDiscountTableComponent,
    TruckersFormComponent,
    DiscountsPipe,
    ContractLiquidationsComponent,
  ]
})
export class ContractInfoPageModule {}
