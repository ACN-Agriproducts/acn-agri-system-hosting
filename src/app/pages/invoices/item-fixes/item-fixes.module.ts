import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ItemFixesPageRoutingModule } from './item-fixes-routing.module';

import { ItemFixesPage } from './item-fixes.page';
import { CoreModule } from '@core/core.module';
import { ItemFormComponent } from './components/item-form/item-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ItemFixesPageRoutingModule,
    CoreModule,
    ItemFormComponent
  ],
  declarations: [ItemFixesPage]
})
export class ItemFixesPageModule {}
