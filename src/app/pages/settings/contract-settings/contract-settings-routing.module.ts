import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContractSettingsPage } from './contract-settings.page';

const routes: Routes = [
  {
    path: '',
    component: ContractSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractSettingsPageRoutingModule {}
