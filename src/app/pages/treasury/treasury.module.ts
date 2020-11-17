import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TreasuryPageRoutingModule } from './treasury-routing.module';

import { TreasuryPage } from './treasury.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TreasuryPageRoutingModule
  ],
  declarations: [TreasuryPage]
})
export class TreasuryPageModule {}
