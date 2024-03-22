import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TicketsClientWeightPageRoutingModule } from './tickets-client-weight-routing.module';

import { TicketsClientWeightPage } from './tickets-client-weight.page';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    IonicModule,
    TicketsClientWeightPageRoutingModule,
    SharedModule
  ],
  declarations: [TicketsClientWeightPage]
})
export class TicketsClientWeightPageModule {}
