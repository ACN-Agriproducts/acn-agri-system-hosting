import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WarehouseReceiptsPage } from './warehouse-receipts.page';

const routes: Routes = [
  {
    path: '',
    component: WarehouseReceiptsPage
  },
  {
    path: 'set',
    loadChildren: () => import('./set-warehouse-receipt-group/set-warehouse-receipt-group.module').then( m => m.SetWarehouseReceiptGroupPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WarehouseReceiptsPageRoutingModule {}
