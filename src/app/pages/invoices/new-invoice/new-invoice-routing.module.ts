import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewInvoicePage } from './new-invoice.page';

const routes: Routes = [
  {
    path: '',
    component: NewInvoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewInvoicePageRoutingModule {}
