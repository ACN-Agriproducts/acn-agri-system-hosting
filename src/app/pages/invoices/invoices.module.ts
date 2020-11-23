import { CoreModule } from '@core/core.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvoicesPageRoutingModule } from './invoices-routing.module';

import { InvoicesPage } from './invoices.page';
import { TableComponent } from './components/table/table.component';
import { ModalComponent } from './components/modal/modal.component';
import { OptionsComponent } from './components/options/options.component';
import {ClipboardModule} from '@angular/cdk/clipboard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvoicesPageRoutingModule,
    CoreModule,
    ClipboardModule
  ],
  declarations: [
    InvoicesPage,
    TableComponent,
    ModalComponent,
    OptionsComponent
  ]
})
export class InvoicesPageModule {}
