import { SettingsService } from './../pages/settings/utils/service/settings.service';
import { NavController } from '@ionic/angular';
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
      icon: 'speedometer'
    },
    {
      title: 'Tickets',
      url: '/dashboard/tickets',
      icon: 'receipt'
    },
    {
      title: 'Inventory',
      url: '/dashboard/inventory',
      icon: 'podium'
    },
    {
      title: 'Invoices',
      url: '/dashboard/invoices',
      icon: 'document-text'
    },
    {
      title: 'Contracts',
      url: '/dashboard/contracts',
      icon: 'newspaper'
    },
    {
      title: 'Treasury',
      url: '/dashboard/treasury',
      icon: 'wallet'
    },
    {
      title: 'Directory',
      url: '/dashboard/directory',
      icon: 'library'
    },
    {
      title: 'Employees',
      url: '/dashboard/employees',
      icon: 'people'
    }
  ];
  public collapse$: Observable<boolean>;
  public displayName$: Observable<boolean>;
  public dataUser: any;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private storage: Storage,
    private serviceSettings: SettingsService
  ) { }

  ngOnInit(): void {
    this.storage.get('user').then(data => {
      console.log(data);
      this.dataUser = data;
    });
    this.authentication.user().subscribe(data => console.log(data));


    this.collapse$ = this.serviceSettings.collapseMenu$;
    this.displayName$ = this.serviceSettings.displayName$;
  }
  public logout = () => {
    this.authentication.logout();
    this.navController.navigateForward('/login');
  }
}
