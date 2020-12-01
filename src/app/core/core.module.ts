import { FormatPriceLetterPipe } from './pipes/FormatPriceLetter/FormatPriceLetter.pipe';
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
    FormatPriceLetterPipe
    // IonicStorageModule
    // FormsModule,
    // ReactiveFormsModule,
  ],
  declarations: [
    FormatPriceLetterPipe
  ]
})
export class CoreModule { }
