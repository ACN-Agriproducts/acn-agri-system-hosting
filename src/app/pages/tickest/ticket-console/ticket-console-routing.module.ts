import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TicketConsolePage } from './ticket-console.page';

const routes: Routes = [
  {
    path: '',
    component: TicketConsolePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketConsolePageRoutingModule {}
