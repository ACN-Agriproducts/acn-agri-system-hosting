import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateInvoicePageRoutingModule } from './create-invoice-routing.module';

import { CreateInvoicePage } from './create-invoice.page';
import { ComponentsModule } from '@core/components/components.module';
import { PrintableInvoiceComponent } from '../components/printable-invoice/printable-invoice.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateInvoicePageRoutingModule,
    ComponentsModule,
  ],
  declarations: [
    CreateInvoicePage,
    PrintableInvoiceComponent
  ]
})
export class CreateInvoicePageModule {}
