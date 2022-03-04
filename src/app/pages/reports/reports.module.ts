import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportsPageRoutingModule } from './reports-routing.module';

import { ReportsPage } from './reports.page';
import { CoreModule } from '@core/core.module';
import { CardButtonComponent } from './components/card-button/card-button.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportsPageRoutingModule,
    CoreModule
  ],
  declarations: [ReportsPage, CardButtonComponent]
})
export class ReportsPageModule {}
