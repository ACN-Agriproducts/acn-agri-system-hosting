import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewContactPage } from './new-contact/new-contact.page';

import { DirectoryPage } from './directory.page';

const routes: Routes = [
  {
    path: '',
    component: DirectoryPage
  },
  {
    path: 'new',
    loadChildren: () => import('./new-contact/new-contact.module').then( m => m.NewContactPageModule)
  },
  {
    path: 'new-contact',
    loadChildren: () => import('./new-contact/new-contact.module').then( m => m.NewContactPageModule)
  },
  {
    path: 'new-contact',
    loadChildren: () => import('./new-contact/new-contact.module').then( m => m.NewContactPageModule)
  },
  {
    path: 'edit-contact/:id',
    loadChildren: () => import('./edit-contact/edit-contact.module').then( m => m.EditContactPageModule)
  },
  {
    path: 'contact/:id',
    loadChildren: () => import('./contact/contact.module').then( m => m.ContactPageModule)
  }



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DirectoryPageRoutingModule {}
