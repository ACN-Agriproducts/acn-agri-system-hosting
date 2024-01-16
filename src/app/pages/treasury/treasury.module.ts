import { OptionsComponent } from './components/options/options.component';
import { CoreModule } from '@core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TreasuryPageRoutingModule } from './treasury-routing.module';

import { TreasuryPage } from './treasury.page';
import { TableComponent } from './components/table/table.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TreasuryPageRoutingModule,
    CoreModule,
    NgxChartsModule
  ],
  declarations: [
    TreasuryPage, 
    TableComponent,
    OptionsComponent
  ]
})
export class TreasuryPageModule {}
