import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductPageRoutingModule } from './product-routing.module';

import { ProductPage } from './product.page';
import { CoreModule } from '@core/core.module';
import { ProductDprTableComponent } from './components/product-dpr-table/product-dpr-table.component';
import { DprTicketsTableComponent } from './components/dpr-tickets-table/dpr-tickets-table.component';
import { DprInvoiceTableComponent } from './components/dpr-invoice-table/dpr-invoice-table.component';
import { DiscountTableComponent } from './components/discount-table/discount-table.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SetDiscountTableDialogComponent } from './components/set-discount-table-dialog/set-discount-table-dialog.component';
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    declarations: [
        ProductPage,
        ProductDprTableComponent,
        DprTicketsTableComponent,
        DprInvoiceTableComponent,
        DiscountTableComponent,
        SetDiscountTableDialogComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ProductPageRoutingModule,
        CoreModule,
        ReactiveFormsModule,
        DragDropModule,
        SharedModule
    ]
})
export class ProductPageModule {}
