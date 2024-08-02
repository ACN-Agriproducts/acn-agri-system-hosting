import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractPaymentReportsPageRoutingModule } from './contract-payment-reports-routing.module';

import { ContractPaymentReportsPage } from './contract-payment-reports.page';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ClientCardComponent } from './components/client-card/client-card.component';
import { ContractsTableComponent } from './components/contracts-table/contracts-table.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ProductDialogComponent } from './components/product-dialog/product-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    IonicModule,
    ContractPaymentReportsPageRoutingModule,
    SharedModule,
    NgxChartsModule
  ],
  declarations: [
    ContractPaymentReportsPage,
    ProductCardComponent,
    ClientCardComponent,
    ContractsTableComponent,
    ProductDialogComponent
  ]
})
export class ContractPaymentReportsPageModule {}
