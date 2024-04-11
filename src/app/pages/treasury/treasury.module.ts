import { OptionsComponent } from './components/options/options.component';
import { CoreModule } from '@core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TreasuryPageRoutingModule } from './treasury-routing.module';

import { TreasuryPage } from './treasury.page';
import { TableComponent } from './components/table/table.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AccountCardComponent } from './components/account-card/account-card.component';
import { SetAccountDialogComponent } from './components/set-account-dialog/set-account-dialog.component';
import { MatRippleModule } from '@angular/material/core';
import { AbsoluteValuePipe, TransactionsTableComponent } from './components/transactions-table/transactions-table.component';
import { SetTransactionDialogComponent } from './components/set-transaction-dialog/set-transaction-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TreasuryPageRoutingModule,
    CoreModule,
    NgxChartsModule,
    MatRippleModule,
    ReactiveFormsModule
  ],
  declarations: [
    TreasuryPage, 
    TableComponent,
    OptionsComponent,
    AccountCardComponent,
    SetAccountDialogComponent,
    TransactionsTableComponent,
    SetTransactionDialogComponent,
    AbsoluteValuePipe
  ],
  providers: [
    TitleCasePipe
  ]
})
export class TreasuryPageModule {}
