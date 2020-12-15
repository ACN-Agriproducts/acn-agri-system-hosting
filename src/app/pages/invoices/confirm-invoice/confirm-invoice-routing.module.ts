import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmInvoicePage } from './confirm-invoice.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmInvoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmInvoicePageRoutingModule {}
