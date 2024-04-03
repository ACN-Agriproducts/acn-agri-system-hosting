import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TicketsClientWeightPage } from './tickets-client-weight.page';

const routes: Routes = [
  {
    path: '',
    component: TicketsClientWeightPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketsClientWeightPageRoutingModule {}
