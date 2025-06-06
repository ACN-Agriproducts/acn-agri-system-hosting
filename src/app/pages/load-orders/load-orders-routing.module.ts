import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadOrdersPage } from './load-orders.page';

const routes: Routes = [
  {
    path: '',
    component: LoadOrdersPage
  },
  {
    path: 'set-load-orders',
    loadChildren: () => import('./set-load-orders/set-load-orders.module').then( m => m.SetLoadOrdersPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadOrdersPageRoutingModule {}
