import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ContractLiquidationLongComponent } from './contract-liquidation-long/contract-liquidation-long.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  exports: [
    ToolbarComponent,
    ContractLiquidationLongComponent
  ],
  declarations: [ToolbarComponent, ContractLiquidationLongComponent]
})
export class SharedModule {}
