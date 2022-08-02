import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WarehouseReceiptsPage } from './warehouse-receipts.page';

const routes: Routes = [
  {
    path: '',
    component: WarehouseReceiptsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WarehouseReceiptsPageRoutingModule {}