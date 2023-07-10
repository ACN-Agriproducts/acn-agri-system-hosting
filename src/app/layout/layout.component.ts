import { SettingsService } from './../pages/settings/utils/service/settings.service';
import {  NavController } from '@ionic/angular';
import { AuthenticationService } from '@core/services/Authentication/Authentication.service';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';
import { SessionInfo } from '@core/services/session-info/session-info.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  public selectedIndex = 0;
  public appPages = [
    {
      title: 'dashboard',
      url: '/dashboard/home',
      icon: 'speedometer',
      permission: p => true,
      permissionName: ''
    },
    {
      title: 'tickets',
      url: '/dashboard/tickets',
      icon: 'receipt',
      permission: p => this.hasPermission('tickets', p),
      permissionName: 'tickets'
    },
    {
      title: 'inventory',
      url: '/dashboard/inventory',
      icon: 'podium',
      permission: p => this.hasPermission('inventory', p),
      permissionName: 'inventory'
    },
    {
      title: 'production orders',
      url: 'dashboard/production-orders',
      icon: 'bag-handle',
      permission: p => this.hasPermission('production-orders', p),
      permissionName: 'production-orders'
    },
    {
      title: 'warehouse receipts',
      url: 'dashboard/warehouse-receipts',
      icon: 'file-tray-full',
      permission: p => this.hasPermission('warehouseReceipts', p),
      permissionName: 'warehouseReceipts'
    },
    {
      title: 'invoices',
      url: '/dashboard/invoices',
      icon: 'document-text',
      permission: p => this.hasPermission('invoices', p),
      permissionName: 'invoices'
    },
    {
      title: 'contracts',
      url: '/dashboard/contracts',
      icon: 'newspaper',
      permission: p => this.hasPermission('contracts', p),
      permissionName: 'contracts'
    },
    {
      title: 'treasury',
      url: '/dashboard/treasury',
      icon: 'wallet',
      permission: p => this.hasPermission('treasury', p) && p.developer,
      permissionName: 'treasury'
    },
    {
      title: 'directory',
      url: '/dashboard/directory',
      icon: 'library',
      permission: p => this.hasPermission('directory', p),
      permissionName: 'contacts'
    },
    {
      title: 'employees',
      url: '/dashboard/employees',
      icon: 'people',
      permission: p => this.hasPermission('tickets', p) && p.developer,
      permissionName: 'employees'
    },
    {
      title: "portfolio",
      url: '/dashboard/portfolio',
      icon: 'bag',
      permission: p => this.hasPermission('tickets', p) && p.developer,
      permissionName: 'portfolio'
    },
    {
      title: "reports",
      url: '/dashboard/reports',
      icon: 'bar-chart',
      permission: p => this.hasPermission('tickets', p),
    }, 
    {
      title: "prices",
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
    private serviceSettings: SettingsService,
    private session: SessionInfo,
    // private nav: IonNav
  ) { }

  ngOnInit(): void {
    this.dataUser = this.session.getUser();
    this.permissions = this.session.getPermissions();
    if(!this.permissions) {
      this.authentication.logout();
    }
    
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
