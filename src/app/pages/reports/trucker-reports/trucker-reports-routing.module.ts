import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TruckerReportsPage } from './trucker-reports.page';

const routes: Routes = [
  {
    path: '',
    component: TruckerReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TruckerReportsPageRoutingModule {}
