import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewLiquidationPage } from './new-liquidation.page';

const routes: Routes = [
  {
    path: '',
    component: NewLiquidationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewLiquidationPageRoutingModule {}
