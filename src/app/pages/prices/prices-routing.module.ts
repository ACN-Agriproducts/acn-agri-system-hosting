import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PricesPage } from './prices.page';

const routes: Routes = [
  {
    path: '',
    component: PricesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DatePipe]
})
export class PricesPageRoutingModule {}
