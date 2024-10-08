import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage, UnitNamePipe } from './home.page';
import { NeedsAdminAttentionComponent } from './components/needs-admin-attention/needs-admin-attention.component';
import { SharedModule } from '@shared/shared.module';
import { ContractsPageModule } from '@pages/contracts/contracts.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    CoreModule,
    SharedModule,
    ContractsPageModule,
    ReactiveFormsModule,
    NgxChartsModule
  ],
  declarations: [
    HomePage,
    NeedsAdminAttentionComponent,
    UnitNamePipe
  ]
})
export class HomePageModule {}
