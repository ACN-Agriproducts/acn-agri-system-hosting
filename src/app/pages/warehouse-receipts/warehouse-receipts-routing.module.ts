import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WarehouseReceiptsPage } from './warehouse-receipts.page';

const routes: Routes = [
  {
    path: '',
    component: WarehouseReceiptsPage
  },
  {
    path: 'create-warehouse-receipt-group',
    loadChildren: () => import('./create-warehouse-receipt-group/create-warehouse-receipt-group.module').then( m => m.CreateWarehouseReceiptGroupPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WarehouseReceiptsPageRoutingModule {}
