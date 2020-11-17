import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CursorDirective } from './cursor.directive';
@NgModule({
  imports: [CommonModule],
  declarations: [CursorDirective],
  exports: [CursorDirective]
})
export class DirectivesCoreModule { }
