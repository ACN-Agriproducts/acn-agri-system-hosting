import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountsPageRoutingModule } from './accounts-routing.module';

import { AccountsPage } from './accounts.page';
import { SharedModule } from '@shared/shared.module';
import { CoreModule } from '@core/core.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountsPageRoutingModule,
    CoreModule,
    SharedModule,
  ],
  declarations: [AccountsPage]
})
export class AccountsPageModule {}
