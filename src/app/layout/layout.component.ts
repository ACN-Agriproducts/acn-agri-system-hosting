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
      title: 'Tickets',
      url: '/tickets',
      icon: 'receipt'
    },
    {
      title: 'Inventory',
      url: '/inventory',
      icon: 'podium'
    },
    {
      title: 'Invoces',
      url: '/invoces',
      icon: 'document-text'
    },
    {
      title: 'Contracts',
      url: '/contracts',
      icon: 'newspaper'
    },
    {
      title: 'Treasury',
      url: '/treasury',
      icon: 'wallet'
    },
    {
      title: 'Directory',
      url: '/directory',
      icon: 'library'
    },
    {
      title: 'Employees',
      url: '/employees',
      icon: 'people'
    }
  ];
  public appOptions = [
    {
      title: 'Setting',
      url: '/settings',
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
