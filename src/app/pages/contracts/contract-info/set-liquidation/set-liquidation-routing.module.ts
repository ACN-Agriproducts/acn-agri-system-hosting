import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetLiquidationPage } from './set-liquidation.page';

const routes: Routes = [
  {
    path: '',
    component: SetLiquidationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewLiquidationPageRoutingModule {}
