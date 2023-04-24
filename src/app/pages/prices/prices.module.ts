import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PricesPageRoutingModule } from './prices-routing.module';

import { EmailNotificationDialog, PricesPage } from './prices.page';
import { CoreModule } from '@core/core.module';
import { FieldRenameComponent } from './field-rename/field-rename.component';
import { NewTableDialogComponent } from './new-table-dialog/new-table-dialog.component';
import { TableImportDialogComponent } from './table-import-dialog/table-import-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PricesPageRoutingModule,
    CoreModule
  ],
  declarations: [
    PricesPage, 
    FieldRenameComponent,
    NewTableDialogComponent,
    TableImportDialogComponent,
    EmailNotificationDialog
  ]
})
export class PricesPageModule {}
