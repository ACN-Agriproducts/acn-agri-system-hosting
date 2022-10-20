import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CursorDirective } from './cursor.directive';
import { PositiveDirective } from './positive/positive.directive';
@NgModule({
  imports: [CommonModule],
  declarations: [CursorDirective, PositiveDirective],
  exports: [CursorDirective, PositiveDirective]
})
export class DirectivesCoreModule { }
