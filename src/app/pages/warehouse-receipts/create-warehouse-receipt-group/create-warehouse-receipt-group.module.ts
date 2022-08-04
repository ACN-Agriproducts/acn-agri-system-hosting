import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateWarehouseReceiptGroupPageRoutingModule } from './create-warehouse-receipt-group-routing.module';

import { CreateWarehouseReceiptGroupPage } from './create-warehouse-receipt-group.page';
import { CoreModule } from '@core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateWarehouseReceiptGroupPageRoutingModule,
    ReactiveFormsModule,
    CoreModule,
  ],
  declarations: [CreateWarehouseReceiptGroupPage]
})
export class CreateWarehouseReceiptGroupPageModule {}
