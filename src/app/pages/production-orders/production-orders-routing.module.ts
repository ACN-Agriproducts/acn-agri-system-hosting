import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductionOrdersPage } from './production-orders.page';

const routes: Routes = [
  {
    path: '',
    component: ProductionOrdersPage
  },
  {
    path: 'set-order',
    loadChildren: () => import('./set-order/set-order.module').then( m => m.SetOrderPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductionOrdersPageRoutingModule {}
