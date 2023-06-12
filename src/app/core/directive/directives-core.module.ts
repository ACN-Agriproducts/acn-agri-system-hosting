import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CursorDirective } from './cursor.directive';
import { PositiveDirective } from './positive/positive.directive';
import { IncludesPipe } from './includes/includes.pipe';
@NgModule({
  imports: [CommonModule],
  declarations: [CursorDirective, PositiveDirective, IncludesPipe],
  exports: [CursorDirective, PositiveDirective, IncludesPipe]
})
export class DirectivesCoreModule { }
