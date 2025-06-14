import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetLoadOrdersPage } from './set-load-orders.page';

const routes: Routes = [
  {
    path: '',
    component: SetLoadOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetLoadOrdersPageRoutingModule {}
