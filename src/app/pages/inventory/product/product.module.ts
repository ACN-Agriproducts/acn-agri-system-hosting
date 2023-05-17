import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductPageRoutingModule } from './product-routing.module';

import { ProductPage } from './product.page';
import { CoreModule } from '@core/core.module';
import { DiscountTableMoistureComponent } from './components/discount-table-moisture/discount-table-moisture.component';
import { ProductDprTableComponent } from './components/product-dpr-table/product-dpr-table.component';
import { DprTicketsTableComponent } from './components/dpr-tickets-table/dpr-tickets-table.component';
import { DprInvoiceTableComponent } from './components/dpr-invoice-table/dpr-invoice-table.component';
import { DiscountTableDamageComponent } from './components/discount-table-damage/discount-table-damage.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductPageRoutingModule,
    CoreModule,
    ReactiveFormsModule,
  ],
  declarations: [
    ProductPage,
    DiscountTableMoistureComponent,
    ProductDprTableComponent,
    DprTicketsTableComponent,
    DprInvoiceTableComponent,
    DiscountTableDamageComponent,
  ]
})
export class ProductPageModule {}
