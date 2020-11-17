
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionBusinessComponent } from './option-business/option-business.component';
import { ButtonBusinessComponent } from './button-business/button-business.component';
import { HeaderToolbarComponent } from './header-toolbar/header-toolbar.component';
// import { NgxDropzoneModule } from 'ngx-dropzone';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // NgxDropzoneModule
  ],
  declarations: [
    OptionBusinessComponent,
    ButtonBusinessComponent,
    HeaderToolbarComponent
  ],
  exports: [
    OptionBusinessComponent,
    ButtonBusinessComponent,
    HeaderToolbarComponent
  ]
})
export class ComponentsModule { }
