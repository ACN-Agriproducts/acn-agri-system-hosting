import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InventoryPage } from './inventory.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryPage
  },
  {
    path: ':product',
    loadChildren: () => import('./product/product.module').then( m => m.ProductPageModule)
  },  {
    path: 'storage-logs',
    loadChildren: () => import('./storage-logs/storage-logs.module').then( m => m.StorageLogsPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryPageRoutingModule {}
