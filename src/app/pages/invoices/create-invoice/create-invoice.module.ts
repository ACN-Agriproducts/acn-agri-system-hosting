import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateInvoicePageRoutingModule } from './create-invoice-routing.module';

import { CreateInvoicePage } from './create-invoice.page';
import { ComponentsModule } from '@core/components/components.module';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateInvoicePageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    SharedModule
  ],
  declarations: [
    CreateInvoicePage
  ]
})
export class CreateInvoicePageModule {}
