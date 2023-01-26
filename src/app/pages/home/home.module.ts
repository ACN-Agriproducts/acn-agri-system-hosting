import { CoreModule } from './../../core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { NeedsAdminAttentionComponent } from './components/needs-admin-attention/needs-admin-attention.component';
import { SharedModule } from '@shared/shared.module';
import { GrainComparizonComponent } from './grain-comparizon/grain-comparizon.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    CoreModule,
    SharedModule,
    NgxChartsModule,
  ],
  declarations: [
    HomePage, 
    NeedsAdminAttentionComponent,
    GrainComparizonComponent
  ],
  providers: [DatePipe]
})
export class HomePageModule {}
