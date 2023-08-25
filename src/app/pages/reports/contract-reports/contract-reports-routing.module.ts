import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContractReportsPage } from './contract-reports.page';

const routes: Routes = [
  {
    path: '',
    component: ContractReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractReportsPageRoutingModule {}
