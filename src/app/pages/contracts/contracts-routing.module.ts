import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContractsPage } from './contracts.page';

const routes: Routes = [
  {
    path: '',
    component: ContractsPage
  },
  {
    path: 'new-contract',
    loadChildren: () => import('./new-contract/new-contract.module').then( m => m.NewContractPageModule)
  },
  {
    path: 'contract-info/:type/:id',
    loadChildren: () => import('./contract-info/contract-info.module').then( m => m.ContractInfoPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractsPageRoutingModule {}
