import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { CardComponentComponent } from './components/card-component/card-component.component';
import { NeedsAdminAttentionComponent } from './components/needs-admin-attention/needs-admin-attention.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    CoreModule
  ],
  declarations: [HomePage, CardComponentComponent, NeedsAdminAttentionComponent]
})
export class HomePageModule {}
