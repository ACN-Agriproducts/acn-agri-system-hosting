import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractsPageRoutingModule } from './contracts-routing.module';

import { ContractsPage } from './contracts.page';
import { ContractModalComponent } from './components/contract-modal/contract-modal.component';
import { OptionsContractComponent } from './components/options-contract/options-contract.component';
import { ShowDetailsComponent } from './components/show-details/show-details.component';
import { OptionFilterComponent } from './components/option-filter/option-filter.component';
import { FilterComponent } from './components/filter/filter.component';
import { ContractModalOptionsComponent } from './components/contract-modal-options/contract-modal-options.component';
import { SharedModule } from '@shared/shared.module';
import { CloseContractFieldsDialogComponent } from './components/close-contract-fields-dialog/close-contract-fields-dialog.component';
import { DeliveredChartCardComponent } from './components/delivered-chart-card/delivered-chart-card.component';
import { LineChartModule, NgxChartsModule } from '@swimlane/ngx-charts';
import { SelectedTicketsPipe } from '@shared/pipes/selectedTickets/selected-tickets.pipe';
import { ContractFormComponent } from './components/contract-form/contract-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ContractsPageRoutingModule,
    CoreModule,
    SharedModule,
    LineChartModule,
    NgxChartsModule
  ],
  declarations: [
    ContractsPage,
    ContractModalComponent,
    OptionsContractComponent,
    ShowDetailsComponent,
    OptionFilterComponent,
    FilterComponent,
    ContractModalOptionsComponent,
    CloseContractFieldsDialogComponent,
    DeliveredChartCardComponent,
    ContractFormComponent
  ],
  exports: [ContractFormComponent],
  providers: [DatePipe, SelectedTicketsPipe]
})
export class ContractsPageModule { }
