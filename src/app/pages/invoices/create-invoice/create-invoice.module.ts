import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateInvoicePageRoutingModule } from './create-invoice-routing.module';

import { CreateInvoicePage } from './create-invoice.page';
import { ComponentsModule } from '@core/components/components.module';
import { PrintableInvoiceComponent } from '../components/printable-invoice/printable-invoice.component';
import { CoreModule } from '@core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateInvoicePageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule
  ],
  declarations: [
    CreateInvoicePage,
    PrintableInvoiceComponent
  ]
})
export class CreateInvoicePageModule {}
