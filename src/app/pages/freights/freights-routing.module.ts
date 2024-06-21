import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FreightsPage } from './freights.page';

const routes: Routes = [
  {
    path: '',
    component: FreightsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FreightsPageRoutingModule {}
