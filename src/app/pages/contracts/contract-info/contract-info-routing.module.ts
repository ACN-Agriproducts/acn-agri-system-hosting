import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContractInfoPage } from './contract-info.page';

const routes: Routes = [
  {
    path: '',
    component: ContractInfoPage
  },
  {
    path: 'set-liquidation',
    loadChildren: () => import('./set-liquidation/set-liquidation.module').then( m => m.NewLiquidationPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractInfoPageRoutingModule {}
