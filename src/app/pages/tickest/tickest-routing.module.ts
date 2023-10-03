import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TickestPage } from './tickest.page';

const routes: Routes = [
  {
    path: '',
    component: TickestPage
  },  {
    path: 'ticket-console',
    loadChildren: () => import('./ticket-console/ticket-console.module').then( m => m.TicketConsolePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TickestPageRoutingModule {}
