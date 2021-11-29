import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ContractPrintableComponent } from './printable/contract-printable/contract-printable.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  exports: [
    ToolbarComponent,
    ContractPrintableComponent
  ],
  declarations: [
    ToolbarComponent,
    ContractPrintableComponent
  ]
})
export class SharedModule {}
