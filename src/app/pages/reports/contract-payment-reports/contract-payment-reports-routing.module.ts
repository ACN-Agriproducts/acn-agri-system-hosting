import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContractPaymentReportsPage } from './contract-payment-reports.page';

const routes: Routes = [
  {
    path: '',
    component: ContractPaymentReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractPaymentReportsPageRoutingModule {}
