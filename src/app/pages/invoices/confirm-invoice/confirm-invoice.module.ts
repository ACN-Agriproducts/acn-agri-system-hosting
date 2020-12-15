import { CoreModule } from './../../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmInvoicePageRoutingModule } from './confirm-invoice-routing.module';

import { ConfirmInvoicePage } from './confirm-invoice.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmInvoicePageRoutingModule,
    CoreModule
  ],
  declarations: [ConfirmInvoicePage]
})
export class ConfirmInvoicePageModule {}
