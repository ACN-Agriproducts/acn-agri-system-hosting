import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemFixesPageRoutingModule } from './item-fixes-routing.module';

import { ItemFixesPage } from './item-fixes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemFixesPageRoutingModule
  ],
  declarations: [ItemFixesPage]
})
export class ItemFixesPageModule {}
