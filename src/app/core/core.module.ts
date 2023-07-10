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
import { StateAbbreviationPipe } from './pipes/stateAbbreviation/state-abbreviation.pipe';
import { AsPipe } from './pipes/Cast/cast-pipe.pipe';
import { ListFindPipe } from './pipes/list-find/list-find.pipe';
import { MassInUnitPipe } from './pipes/MassInUnit/mass-in-unit.pipe';
import { TypeTemplateDirective } from './directive/type-template/type-template.directive';
import { TruncatePipe } from './pipes/truncate/truncate.pipe';
import { MassDisplayPipe } from './pipes/mass/mass-display.pipe';
import { RoundPipe } from './pipes/round/round.pipe';
import { TranslatePipe } from './pipes/translate/translate.pipe';
import { IncludesPipe } from './pipes/includes/includes.pipe';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    // FormsModule,
    // IonicModule,
    MaterialModule,
    NgxDropzoneModule,
    DirectivesCoreModule,
    TranslocoModule
    
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
    StateAbbreviationPipe,
    AsPipe,
    ListFindPipe,
    MassInUnitPipe,
    TypeTemplateDirective,
    MassDisplayPipe,
    TruncatePipe,
    RoundPipe,
    TranslatePipe,
    IncludesPipe,
    TranslocoModule
    // IonicStorageModule
    // FormsModule,
    // ReactiveFormsModule,
  ],
  declarations: [
    FormatPriceLetterPipe,
    FormatStringPipe,
    SearchPipe,
    StateAbbreviationPipe,
    AsPipe,
    ListFindPipe,
    MassInUnitPipe,
    TypeTemplateDirective,
    TruncatePipe,
    MassDisplayPipe,
    RoundPipe,
    TranslatePipe,
    IncludesPipe
  ]
})
export class CoreModule { }
