import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StorageLogsPageRoutingModule } from './storage-logs-routing.module';

import { StorageLogsPage } from './storage-logs.page';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { InventoryPageModule } from '../inventory.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StorageLogsPageRoutingModule,
    CoreModule,
    SharedModule,
  ],
  declarations: [StorageLogsPage]
})
export class StorageLogsPageModule {}
