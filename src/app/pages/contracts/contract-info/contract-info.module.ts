import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractInfoPageRoutingModule } from './contract-info-routing.module';

import { ContractInfoPage } from './contract-info.page';
import { CoreModule } from '@core/core.module';
import { TicketsTableComponent } from './components/tickets-table/tickets-table.component';
import { TruckerTableComponent } from './components/trucker-table/trucker-table.component';
import { NgxPrintModule } from 'ngx-print';
import { DisplayContractComponent } from './components/display-contract/display-contract.component';
import { SharedModule } from '@shared/shared.module';
import { TruckersFormComponent } from './components/truckers-form/truckers-form.component';
import { ContractModule } from 'src/app/modules/contract/contract.module';
import { ContractPrintablesModule } from 'src/app/modules/contract-printables/contract-printables.module';
import { LiquidationTableComponent, TicketIdsPipe } from './components/liquidation-table/liquidation-table.component';
import { PaymentsTableComponent } from './components/payments-table/payments-table.component';
import { SetPaymentDialogComponent, ValidPaymentSelectionDirective } from './components/set-payment-dialog/set-payment-dialog.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ContractChartCardComponent } from './components/contract-chart-card/contract-chart-card.component';

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
    NgxChartsModule
  ],
  declarations: [
    ContractInfoPage,
    TicketsTableComponent,
    TruckerTableComponent,
    DisplayContractComponent,
    TruckersFormComponent,
    LiquidationTableComponent,
    TicketIdsPipe,
    PaymentsTableComponent,
    SetPaymentDialogComponent,
    ValidPaymentSelectionDirective,
    ContractChartCardComponent
  ]
})
export class ContractInfoPageModule {}
