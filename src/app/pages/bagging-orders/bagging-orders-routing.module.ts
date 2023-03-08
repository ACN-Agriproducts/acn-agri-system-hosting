import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BaggingOrdersPage } from './bagging-orders.page';

const routes: Routes = [
  {
    path: '',
    component: BaggingOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BaggingOrdersPageRoutingModule {}
