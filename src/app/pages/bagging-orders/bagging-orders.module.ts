import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BaggingOrdersPageRoutingModule } from './bagging-orders-routing.module';

import { BaggingOrdersPage } from './bagging-orders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BaggingOrdersPageRoutingModule
  ],
  declarations: [BaggingOrdersPage]
})
export class BaggingOrdersPageModule {}
