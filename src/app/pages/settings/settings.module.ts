import { CoreModule } from '@core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';
import { SystemSettingsComponent } from './system-settings/system-settings.component';
import { UserDataComponent } from './user-data/user-data.component';
import { NewUserComponent } from './new-user/new-user.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingsPageRoutingModule,
    CoreModule
  ],
  declarations: [SettingsPage, SystemSettingsComponent, UserDataComponent, NewUserComponent]
})
export class SettingsPageModule {}
