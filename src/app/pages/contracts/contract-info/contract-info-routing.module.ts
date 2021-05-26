import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContractInfoPage } from './contract-info.page';

const routes: Routes = [
  {
    path: '',
    component: ContractInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractInfoPageRoutingModule {}
