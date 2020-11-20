import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesCoreModule } from './directive/directives-core.module';
import { MaterialModule } from './modules/material.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from './components/components.module';

import { NgxDropzoneModule } from 'ngx-dropzone';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    // FormsModule,
    // IonicModule,
    MaterialModule,
    NgxDropzoneModule,
    DirectivesCoreModule,
    // FormsModule,
    // ReactiveFormsModule,
  ],
  exports: [
    ComponentsModule,
    MaterialModule,
    DirectivesCoreModule,
    // FormsModule,
    // ReactiveFormsModule,
  ],
  declarations: []
})
export class CoreModule { }
