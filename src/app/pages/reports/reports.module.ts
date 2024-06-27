import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportsPageRoutingModule } from './reports-routing.module';

import { ReportsPage } from './reports.page';
import { CoreModule } from '@core/core.module';
import { CardButtonComponent } from './components/card-button/card-button.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MonthlyTicketsComponent } from './components/monthly-tickets/monthly-tickets.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportsPageRoutingModule,
    CoreModule,
    MatDialogModule
  ],
  declarations: [ReportsPage, CardButtonComponent, MonthlyTicketsComponent]
})
export class ReportsPageModule {}
