import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TreasuryPage } from './treasury.page';

const routes: Routes = [
  {
    path: '',
    component: TreasuryPage
  },  {
    path: 'accounts',
    loadChildren: () => import('./accounts/accounts.module').then( m => m.AccountsPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TreasuryPageRoutingModule {}
