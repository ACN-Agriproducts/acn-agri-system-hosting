import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WarehouseReceiptsPageRoutingModule } from './warehouse-receipts-routing.module';

import { WarehouseReceiptsPage } from './warehouse-receipts.page';
import { WarehouseReceiptsComponent } from '@pages/inventory/components/warehouse-receipts/warehouse-receipts.component';
import { NewWarehouseReceiptModalComponent } from '@pages/inventory/components/new-warehouse-receipt-modal/new-warehouse-receipt-modal.component';
import { WarehouseReceiptStatusPopoverComponent } from '@pages/inventory/components/warehouse-receipt-status-popover/warehouse-receipt-status-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WarehouseReceiptsPageRoutingModule
  ],
  declarations: [
    WarehouseReceiptsPage,
    WarehouseReceiptsComponent,
    NewWarehouseReceiptModalComponent,
    WarehouseReceiptStatusPopoverComponent,
  ]
})
export class WarehouseReceiptsPageModule {}
