import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { NeedsAdminAttentionComponent } from './components/needs-admin-attention/needs-admin-attention.component';
import { SharedModule } from '@shared/shared.module';
import { GrainComparizonComponent } from './grain-comparizon/grain-comparizon.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    CoreModule,
    SharedModule
  ],
  declarations: [
    HomePage, 
    NeedsAdminAttentionComponent,
    GrainComparizonComponent
  ]
})
export class HomePageModule {}
