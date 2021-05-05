import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewContractPage } from './new-contract.page';

const routes: Routes = [
  {
    path: '',
    component: NewContractPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewContractPageRoutingModule {}
