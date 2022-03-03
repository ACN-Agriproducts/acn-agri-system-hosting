import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TruckerReportsPageRoutingModule } from './trucker-reports-routing.module';

import { TruckerReportsPage } from './trucker-reports.page';
import { CoreModule } from '@core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TruckerReportsPageRoutingModule,
    CoreModule
  ],
  declarations: [TruckerReportsPage]
})
export class TruckerReportsPageModule {}
