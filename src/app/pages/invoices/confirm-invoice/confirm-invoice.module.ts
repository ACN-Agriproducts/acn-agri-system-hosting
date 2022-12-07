import { CoreModule } from './../../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmInvoicePageRoutingModule } from './confirm-invoice-routing.module';

import { ConfirmInvoicePage } from './confirm-invoice.page';
import { SharedModule } from '@shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxPrintModule } from 'ngx-print';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmInvoicePageRoutingModule,
    CoreModule,
    SharedModule,
    DragDropModule,
    NgxPrintModule
  ],
  declarations: [ConfirmInvoicePage]
})
export class ConfirmInvoicePageModule {}
