import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesCoreModule } from './directive/directives-core.module';
import { MaterialModule } from './modules/material.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from './components/components.module';

import { NgxDropzoneModule } from 'ngx-dropzone';
import { IonicStorageModule } from '@ionic/storage';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    // FormsModule,
    // IonicModule,
    MaterialModule,
    NgxDropzoneModule,
    DirectivesCoreModule,
    // IonicStorageModule.forRoot()

    // FormsModule,
    // ReactiveFormsModule,
  ],
  exports: [
    ComponentsModule,
    MaterialModule,
    DirectivesCoreModule,
    // IonicStorageModule
    // FormsModule,
    // ReactiveFormsModule,
  ],
  declarations: []
})
export class CoreModule { }
