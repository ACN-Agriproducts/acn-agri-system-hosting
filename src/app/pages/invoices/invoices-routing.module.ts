import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvoicesPage } from './invoices.page';

const routes: Routes = [
  {
    path: '',
    component: InvoicesPage,
  },
  {
    path: 'new',
    loadChildren: () => import('./new-invoice/new-invoice.module').then(m => m.NewInvoicePageModule)
  },
  {
    path: 'confirm-invoice',
    loadChildren: () => import('./confirm-invoice/confirm-invoice.module').then( m => m.ConfirmInvoicePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicesPageRoutingModule { }
