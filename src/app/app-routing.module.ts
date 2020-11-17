import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard/home',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        children: [
          {
            path: 'home',
            loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
          },
          {
            path: 'tickets',
            loadChildren: () => import('./pages/tickest/tickest.module').then(m => m.TickestPageModule)
          },
          {
            path: 'inventory',
            loadChildren: () => import('./pages/inventory/inventory.module').then(m => m.InventoryPageModule)
          },
          {
            path: 'invoices',
            loadChildren: () => import('./pages/invoices/invoices.module').then(m => m.InvoicesPageModule)
          },
          {
            path: 'contracts',
            loadChildren: () => import('./pages/contracts/contracts.module').then(m => m.ContractsPageModule)
          },
          {
            path: 'treasury',
            loadChildren: () => import('./pages/treasury/treasury.module').then(m => m.TreasuryPageModule)
          },
          {
            path: 'employees',
            loadChildren: () => import('./pages/employees/employees.module').then(m => m.EmployeesPageModule)
          },
          {
            path: 'directory',
            loadChildren: () => import('./pages/directory/directory.module').then(m => m.DirectoryPageModule)
          },
          // {
          //   path: '',
          //   data: { preload: true, title: 'Kabik' },
          //   loadChildren: () => import('@pages/home/home.module').then(m => m.HomeModule),
          // },
        ]
      }
    ]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },

  // {
  //   path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full'
  // },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
