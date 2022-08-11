import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetWarehouseReceiptGroupPageRoutingModule } from './set-warehouse-receipt-group-routing.module';

import { SetWarehouseReceiptGroupPage } from './set-warehouse-receipt-group.page';
import { CoreModule } from '@core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetWarehouseReceiptGroupPageRoutingModule,
    ReactiveFormsModule,
    CoreModule
  ],
  declarations: [SetWarehouseReceiptGroupPage]
})
export class SetWarehouseReceiptGroupPageModule {}
