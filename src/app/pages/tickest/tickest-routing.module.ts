import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TickestPage } from './tickest.page';

const routes: Routes = [
  {
    path: '',
    component: TickestPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TickestPageRoutingModule {}
