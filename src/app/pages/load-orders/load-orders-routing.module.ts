import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadOrdersPage } from './load-orders.page';

const routes: Routes = [
  {
    path: '',
    component: LoadOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadOrdersPageRoutingModule {}
