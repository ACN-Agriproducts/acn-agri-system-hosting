import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoadOrdersPageRoutingModule } from './load-orders-routing.module';

import { LoadOrdersPage } from './load-orders.page';
import { CoreModule } from '@core/core.module';
import { MatDialogModule } from '@angular/material/dialog';
import { SetOrderModalComponent } from './components/set-order-modal/set-order-modal.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadOrdersPageRoutingModule,
    CoreModule,
    MatDialogModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [LoadOrdersPage, SetOrderModalComponent]
})
export class LoadOrdersPageModule {}
