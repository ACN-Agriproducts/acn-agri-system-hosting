import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { NeedsAdminAttentionComponent } from './components/needs-admin-attention/needs-admin-attention.component';
import { SharedModule } from '@shared/shared.module';
import { ContractsPageModule } from '@pages/contracts/contracts.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    CoreModule,
    SharedModule,
    ContractsPageModule
  ],
  declarations: [HomePage, NeedsAdminAttentionComponent]
})
export class HomePageModule {}
