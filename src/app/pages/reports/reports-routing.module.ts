import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportsPage } from './reports.page';

const routes: Routes = [
  {
    path: '',
    component: ReportsPage
  },
  {
    path: 'trucker-reports',
    loadChildren: () => import('./trucker-reports/trucker-reports.module').then( m => m.TruckerReportsPageModule)
  },  {
    path: 'contract-reports',
    loadChildren: () => import('./contract-reports/contract-reports.module').then( m => m.ContractReportsPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsPageRoutingModule {}
