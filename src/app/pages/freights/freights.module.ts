import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FreightsPageRoutingModule } from './freights-routing.module';

import { FreightsPage } from './freights.page';
import { CoreModule } from '@core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FreightsPageRoutingModule,
    CoreModule
  ],
  declarations: [FreightsPage]
})
export class FreightsPageModule {}
