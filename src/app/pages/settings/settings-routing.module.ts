import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsPage } from './settings.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage
  },  {
    path: 'contract-settings',
    loadChildren: () => import('./contract-settings/contract-settings.module').then( m => m.ContractSettingsPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
