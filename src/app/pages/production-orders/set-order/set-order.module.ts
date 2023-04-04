import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetOrderPageRoutingModule } from './set-order-routing.module';

import { SetOrderPage } from './set-order.page';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CoreModule,
    SetOrderPageRoutingModule,
    SharedModule,
  ],
  declarations: [SetOrderPage]
})
export class SetOrderPageModule {}
