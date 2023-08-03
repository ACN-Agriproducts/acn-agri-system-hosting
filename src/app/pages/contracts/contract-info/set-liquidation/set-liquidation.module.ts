import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewLiquidationPageRoutingModule } from './set-liquidation-routing.module';

import { SetLiquidationPage } from './set-liquidation.page';
import { CoreModule } from '@core/core.module';
import { TicketDiscountTableComponent } from '../set-liquidation/components/ticket-discount-table/ticket-discount-table.component';
import { NgxPrintModule } from 'ngx-print';
import { LiquidationPrintablesModule } from 'src/app/modules/liquidation-printables/liquidation-printables.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewLiquidationPageRoutingModule,
    CoreModule,
    NgxPrintModule,
    LiquidationPrintablesModule,
  ],
  declarations: [
    SetLiquidationPage,
    TicketDiscountTableComponent,
  ]
})
export class NewLiquidationPageModule {}
