import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InventoryPageRoutingModule } from './inventory-routing.module';

import { InventoryPage } from './inventory.page';
import { NewStorageModalComponent } from './components/new-storage-modal/new-storage-modal.component';

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
    NewStorageModalComponent
  ]
})
export class InventoryPageModule {}
