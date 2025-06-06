import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetLoadOrdersPageRoutingModule } from './set-load-orders-routing.module';

import { SetLoadOrdersPage } from './set-load-orders.page';
import { CoreModule } from "../../../core/core.module";
import { ComponentsModule } from "../../../core/components/components.module";
import { LoadOrderPrintablesModule } from 'src/app/modules/load-order-printables/load-order-printables.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetLoadOrdersPageRoutingModule,
    CoreModule,
    SetLoadOrdersPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule,
    LoadOrderPrintablesModule
  ],
  declarations: [SetLoadOrdersPage]
})
export class SetLoadOrdersPageModule {}
