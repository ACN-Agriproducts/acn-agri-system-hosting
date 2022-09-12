import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WarehouseReceiptsPageRoutingModule } from './warehouse-receipts-routing.module';

import { WarehouseReceiptsPage } from './warehouse-receipts.page';
import { WarehouseReceiptStatusPopoverComponent } from '@pages/warehouse-receipts/components/warehouse-receipt-status-popover/warehouse-receipt-status-popover.component';
import { CoreModule } from '@core/core.module';
import { WarehouseReceiptGroupCardComponent } from './components/warehouse-receipt-group-card/warehouse-receipt-group-card.component';
import { SetContractModalComponent } from './components/set-contract-modal/set-contract-modal.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ViewContractDialogComponent } from './components/view-contract-dialog/view-contract-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WarehouseReceiptsPageRoutingModule,
    ReactiveFormsModule,
    CoreModule,
    FormsModule,
    NgxDropzoneModule,
  ],
  declarations: [
    WarehouseReceiptsPage,
    WarehouseReceiptGroupCardComponent,
    SetContractModalComponent,
    WarehouseReceiptStatusPopoverComponent,
    ViewContractDialogComponent,
  ]
})
export class WarehouseReceiptsPageModule {}
