import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContractSettingsPageRoutingModule } from './contract-settings-routing.module';

import { ContractSettingsPage, MoveGroupDialog, NameDialog } from './contract-settings.page';
import { CoreModule } from '@core/core.module';
import { CdkAccordionModule } from '@angular/cdk/accordion';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContractSettingsPageRoutingModule,
    CoreModule,
    CdkAccordionModule
  ],
  declarations: [
    ContractSettingsPage,
    NameDialog,
    MoveGroupDialog
  ]
})
export class ContractSettingsPageModule {}
