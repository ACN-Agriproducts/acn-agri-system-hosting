import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemFixesPage } from './item-fixes.page';

const routes: Routes = [
  {
    path: '',
    component: ItemFixesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemFixesPageRoutingModule {}
