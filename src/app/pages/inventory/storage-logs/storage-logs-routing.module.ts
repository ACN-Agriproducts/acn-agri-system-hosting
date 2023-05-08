import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StorageLogsPage } from './storage-logs.page';

const routes: Routes = [
  {
    path: '',
    component: StorageLogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StorageLogsPageRoutingModule {}
