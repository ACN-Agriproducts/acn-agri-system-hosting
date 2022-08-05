import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetWarehouseReceiptGroupPage } from './set-warehouse-receipt-group.page';

const routes: Routes = [
  {
    path: '',
    component: SetWarehouseReceiptGroupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SetWarehouseReceiptGroupPageRoutingModule {}
