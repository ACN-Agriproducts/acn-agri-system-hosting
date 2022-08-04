import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateWarehouseReceiptGroupPage } from './create-warehouse-receipt-group.page';

const routes: Routes = [
  {
    path: '',
    component: CreateWarehouseReceiptGroupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateWarehouseReceiptGroupPageRoutingModule {}
