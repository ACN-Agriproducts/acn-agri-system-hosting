import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TruckerReportsPageRoutingModule } from './trucker-reports-routing.module';

import { DialogChooseName, TruckerReportsPage } from './trucker-reports.page';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { NgxPrintModule } from 'ngx-print';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TruckerReportsPageRoutingModule,
    CoreModule,
    SharedModule,
    NgxPrintModule
  ],
  declarations: [TruckerReportsPage, DialogChooseName]
})
export class TruckerReportsPageModule {}
