import { Component, OnInit } from '@angular/core';

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
  public appOptions = [
    {
      title: 'Setting',
      url: '/dashboard/settings',
      icon: 'settings'
    },
    {
      title: 'Sign out',
      url: '/login',
      icon: 'log-out'
    }
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
