import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractSettingsPageRoutingModule } from './contract-settings-routing.module';

import { ContractSettingsPage } from './contract-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContractSettingsPageRoutingModule
  ],
  declarations: [ContractSettingsPage]
})
export class ContractSettingsPageModule {}
