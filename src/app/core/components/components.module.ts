
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionBusinessComponent } from './option-business/option-business.component';
import { ButtonBusinessComponent } from './button-business/button-business.component';
import { HeaderToolbarComponent } from './header-toolbar/header-toolbar.component';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { MaterialModule } from '@core/modules/material.module';
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
    ContextMenuComponent
  ],
  exports: [
    OptionBusinessComponent,
    ButtonBusinessComponent,
    HeaderToolbarComponent,
    ContextMenuComponent
  ]
})
export class ComponentsModule { }
