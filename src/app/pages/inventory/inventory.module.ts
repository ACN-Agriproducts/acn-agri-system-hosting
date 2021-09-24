import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryPageRoutingModule } from './inventory-routing.module';

import { InventoryPage } from './inventory.page';
import { NewStorageModalComponent } from './components/new-storage-modal/new-storage-modal.component';
import { StoragePopoverComponent } from './components/storage-popover/storage-popover.component';
import { MoveInvDialogComponent } from './components/storage-popover/dialogs/move-inv-dialog/move-inv-dialog.component';
import { EditInvDialogComponent } from './components/storage-popover/dialogs/edit-inv-dialog/edit-inv-dialog.component';
import { ZeroOutTankDialogComponent } from './components/storage-popover/dialogs/zero-out-tank-dialog/zero-out-tank-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InventoryPageRoutingModule,
    CoreModule,
    ReactiveFormsModule
  ],
  declarations: [
    InventoryPage,
    NewStorageModalComponent,
    StoragePopoverComponent
  ],
  bootstrap: [
    MoveInvDialogComponent,
    EditInvDialogComponent,
    ZeroOutTankDialogComponent
  ]
})
export class InventoryPageModule {}
