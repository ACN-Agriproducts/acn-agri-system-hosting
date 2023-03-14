import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductionOrdersPageRoutingModule } from './production-orders-routing.module';

import { ProductionOrdersPage } from './production-orders.page';
import { CoreModule } from '@core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoreModule,
    ProductionOrdersPageRoutingModule
  ],
  declarations: [ProductionOrdersPage]
})
export class BaggingOrdersPageModule {}
