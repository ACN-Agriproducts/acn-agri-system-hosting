import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BaggingOrdersPage } from './bagging-orders.page';

const routes: Routes = [
  {
    path: '',
    component: BaggingOrdersPage
  },  {
    path: 'set-order',
    loadChildren: () => import('./set-order/set-order.module').then( m => m.SetOrderPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BaggingOrdersPageRoutingModule {}
