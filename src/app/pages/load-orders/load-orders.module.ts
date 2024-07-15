import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoadOrdersPageRoutingModule } from './load-orders-routing.module';

import { LoadOrdersPage } from './load-orders.page';
import { CoreModule } from '@core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadOrdersPageRoutingModule,
    CoreModule
  ],
  declarations: [LoadOrdersPage]
})
export class LoadOrdersPageModule {}
