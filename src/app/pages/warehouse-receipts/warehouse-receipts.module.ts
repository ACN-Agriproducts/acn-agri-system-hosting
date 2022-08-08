import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WarehouseReceiptsPageRoutingModule } from './warehouse-receipts-routing.module';

import { WarehouseReceiptsPage } from './warehouse-receipts.page';
import { WarehouseReceiptsComponent } from '@pages/warehouse-receipts/components/warehouse-receipts/warehouse-receipts.component';
import { NewWarehouseReceiptModalComponent } from '@pages/warehouse-receipts/components/new-warehouse-receipt-modal/new-warehouse-receipt-modal.component';
import { WarehouseReceiptStatusPopoverComponent } from '@pages/warehouse-receipts/components/warehouse-receipt-status-popover/warehouse-receipt-status-popover.component';
import { CoreModule } from '@core/core.module';
import { WarehouseReceiptGroupCardComponent } from './components/warehouse-receipt-group-card/warehouse-receipt-group-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WarehouseReceiptsPageRoutingModule,
    ReactiveFormsModule,
    CoreModule
  ],
  declarations: [
    WarehouseReceiptsPage,
    WarehouseReceiptStatusPopoverComponent,
    WarehouseReceiptGroupCardComponent
  ]
})
export class WarehouseReceiptsPageModule {}
