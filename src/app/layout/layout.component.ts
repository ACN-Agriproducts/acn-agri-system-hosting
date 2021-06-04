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
      permissionName: ''
    },
    {
      title: 'Tickets',
      url: '/dashboard/tickets',
      icon: 'receipt',
      permissionName: 'tickets'
    },
    {
      title: 'Inventory',
      url: '/dashboard/inventory',
      icon: 'podium',
      permissionName: 'inventory'
    },
    {
      title: 'Invoices',
      url: '/dashboard/invoices',
      icon: 'document-text',
      permissionName: 'invoices'
    },
    {
      title: 'Contracts',
      url: '/dashboard/contracts',
      icon: 'newspaper',
      permissionName: 'contracts'
    },
    {
      title: 'Treasury',
      url: '/dashboard/treasury',
      icon: 'wallet',
      permissionName: 'treasury'
    },
    {
      title: 'Directory',
      url: '/dashboard/directory',
      icon: 'library',
      permissionName: 'contacts'
    },
    {
      title: 'Employees',
      url: '/dashboard/employees',
      icon: 'people',
      permissionName: 'employees'
    },
    {
      title: "Portfolio",
      url: '/dashboard/portfolio',
      icon: 'bag',
      permissionName: 'portfolio'
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
      console.log(data);
      this.dataUser = data;
      this.permissions = data.currentPermissions;

      this.ready = true;
    });
    this.authentication.user().subscribe(data => console.log(data));


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
}
