import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductPageRoutingModule } from './product-routing.module';

import { SetDiscountTableDialog, ProductPage } from './product.page';
import { CoreModule } from '@core/core.module';
import { DiscountTableMoistureComponent } from './components/discount-table-moisture/discount-table-moisture.component';
import { ProductDprTableComponent } from './components/product-dpr-table/product-dpr-table.component';
import { DprTicketsTableComponent } from './components/dpr-tickets-table/dpr-tickets-table.component';
import { DprInvoiceTableComponent } from './components/dpr-invoice-table/dpr-invoice-table.component';
import { DiscountTableComponent } from './components/discount-table/discount-table.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductPageRoutingModule,
    CoreModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  declarations: [
    ProductPage,
    DiscountTableMoistureComponent,
    ProductDprTableComponent,
    DprTicketsTableComponent,
    DprInvoiceTableComponent,
    DiscountTableComponent,
    SetDiscountTableDialog
  ]
})
export class ProductPageModule {}
