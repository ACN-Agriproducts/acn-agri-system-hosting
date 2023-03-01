import { SearchPipe } from './pipes/Search/search.pipe';
import { FormatStringPipe } from './pipes/FormatString/formatString.pipe';
import { FormatPriceLetterPipe } from './pipes/FormatPriceLetter/FormatPriceLetter.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesCoreModule } from './directive/directives-core.module';
import { MaterialModule } from './modules/material.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from './components/components.module';

import { NgxDropzoneModule } from 'ngx-dropzone';
import { IonicStorageModule } from '@ionic/storage';
import { AsPipe } from './pipes/Cast/cast-pipe.pipe';
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
    FormatStringPipe,
    MaterialModule,
    DirectivesCoreModule,
    FormatPriceLetterPipe,
    SearchPipe,
    AsPipe
    // IonicStorageModule
    // FormsModule,
    // ReactiveFormsModule,
  ],
  declarations: [
    FormatPriceLetterPipe,
    FormatStringPipe,
    SearchPipe,
    AsPipe
  ]
})
export class CoreModule { }
