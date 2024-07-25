import { CoreModule } from '@core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvoicesPageRoutingModule } from './invoices-routing.module';

import { InvoicesPage } from './invoices.page';
import { TableComponent } from './components/table/table.component';
import { OptionsComponent } from './components/options/options.component';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { OptionNewInvoiceComponent } from './components/option-new-invoice/option-new-invoice.component';
import { SetItemsDialogComponent } from './components/set-items-dialog/set-items-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvoicesPageRoutingModule,
    CoreModule,
    ClipboardModule,
    ReactiveFormsModule,
  ],
  declarations: [
    InvoicesPage,
    TableComponent,
    OptionsComponent,
    OptionNewInvoiceComponent,
    SetItemsDialogComponent,
  ]
})
export class InvoicesPageModule {}
