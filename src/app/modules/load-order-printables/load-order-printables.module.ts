import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@core/core.module';
import { PrintableLoadOrderComponent } from './printable-load-order/printable-load-order.component';
import { LoadOrderDialogComponent } from './load-order-dialog/load-order-dialog.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    PrintableLoadOrderComponent,
    LoadOrderDialogComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    SharedModule
],
  exports: [
    PrintableLoadOrderComponent,
    LoadOrderDialogComponent
  ]
})
export class LoadOrderPrintablesModule { }
