import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewLiquidationPageRoutingModule } from './new-liquidation-routing.module';

import { NewLiquidationPage } from './new-liquidation.page';
import { CoreModule } from '@core/core.module';
import { TicketDiscountTableComponent } from './components/ticket-discount-table/ticket-discount-table.component';
import { NgxPrintModule } from 'ngx-print';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewLiquidationPageRoutingModule,
    CoreModule,
    NgxPrintModule,
  ],
  declarations: [
    NewLiquidationPage,
    TicketDiscountTableComponent,
  ]
})
export class NewLiquidationPageModule {}
