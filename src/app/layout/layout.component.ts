import { SettingsService } from './../pages/settings/utils/service/settings.service';
import {  NavController } from '@ionic/angular';
import { AuthenticationService } from '@core/services/Authentication/Authentication.service';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  public selectedIndex = 0;
  public appPages = [
    {
      title: 'Dashboard',
      url: '/dashboard/home',
      icon: 'speedometer',
      permission: p => true,
      permissionName: ''
    },
    {
      title: 'Tickets',
      url: '/dashboard/tickets',
      icon: 'receipt',
      permission: p => this.hasPermission('tickets', p),
      permissionName: 'tickets'
    },
    {
      title: 'Inventory',
      url: '/dashboard/inventory',
      icon: 'podium',
      permission: p => this.hasPermission('inventory', p),
      permissionName: 'inventory'
    },
    {
      title: 'Warehouse Receipts',
      url: 'dashboard/warehouse-receipts',
      icon: 'file-tray-full',
      permission: p => this.hasPermission('warehouseReceipts', p),
      permissionName: 'warehouseReceipts'
    },
    {
      title: 'Invoices',
      url: '/dashboard/invoices',
      icon: 'document-text',
      permission: p => this.hasPermission('invoices', p),
      permissionName: 'invoices'
    },
    {
      title: 'Contracts',
      url: '/dashboard/contracts',
      icon: 'newspaper',
      permission: p => this.hasPermission('contracts', p),
      permissionName: 'contracts'
    },
    {
      title: 'Treasury',
      url: '/dashboard/treasury',
      icon: 'wallet',
      permission: p => this.hasPermission('treasury', p) && p.developer,
      permissionName: 'treasury'
    },
    {
      title: 'Directory',
      url: '/dashboard/directory',
      icon: 'library',
      permission: p => this.hasPermission('directory', p),
      permissionName: 'contacts'
    },
    {
      title: 'Employees',
      url: '/dashboard/employees',
      icon: 'people',
      permission: p => this.hasPermission('tickets', p) && p.developer,
      permissionName: 'employees'
    },
    {
      title: "Portfolio",
      url: '/dashboard/portfolio',
      icon: 'bag',
      permission: p => this.hasPermission('tickets', p) && p.developer,
      permissionName: 'portfolio'
    },
    {
      title: "Reports",
      url: '/dashboard/reports',
      icon: 'bar-chart',
      permission: p => this.hasPermission('tickets', p),
    }, 
    {
      title: "Precios",
      url: '/dashboard/prices',
      icon: 'pricetag',
      permission: p => this.hasPermission('prices', p) || p?.prices?.write,
    }
  ];
  public collapse$: Observable<boolean>;
  public displayName$: Observable<boolean>;
  public dataUser: any;
  public permissions: any;
  public ready: boolean = false;
  // public nextPage = LayoutComponent;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private storage: Storage,
    private serviceSettings: SettingsService,
    // private nav: IonNav
  ) { }

  ngOnInit(): void {
    this.storage.get('user').then(data => {
      this.dataUser = data;
      this.permissions = data.currentPermissions;
      if(!this.permissions) {
        this.authentication.logout();
      }

      this.ready = true;
    });
    
    this.collapse$ = this.serviceSettings.collapseMenu$;
    this.displayName$ = this.serviceSettings.displayName$;
  }
  public test = () => {
    // this.nav.push(this.nextPage, { level: 0 + 1 });
  }
  public logout = () => {
    this.authentication.logout();
    this.navController.navigateForward('/login');
  }

  public hasPermission(name: string, p: any):boolean {
    return p.admin != null && p.admin || p[name]!= null && p[name].read
  }
}
