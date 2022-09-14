import { FileInvoiceComponent } from './../components/file-invoice/file-invoice.component';

import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionBusinessComponent } from './option-business/option-business.component';
import { ButtonBusinessComponent } from './button-business/button-business.component';
import { HeaderToolbarComponent } from './header-toolbar/header-toolbar.component';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { MaterialModule } from '@core/modules/material.module';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
// import { NgxDropzoneModule } from 'ngx-dropzone';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaterialModule
    // NgxDropzoneModule
  ],
  declarations: [
    OptionBusinessComponent,
    ButtonBusinessComponent,
    HeaderToolbarComponent,
    ContextMenuComponent,
    FileInvoiceComponent,
    SnackbarComponent,
    ConfirmationDialogComponent,
  ],
  exports: [
    OptionBusinessComponent,
    ButtonBusinessComponent,
    HeaderToolbarComponent,
    ContextMenuComponent,
    FileInvoiceComponent
  ]
})
export class ComponentsModule { }
