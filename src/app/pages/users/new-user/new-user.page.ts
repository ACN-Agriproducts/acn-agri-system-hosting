import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.page.html',
  styleUrls: ['./new-user.page.scss'],
})
export class NewUserPage implements OnInit {
  public worksAtList: string[] = ['ACN', 'TestCo', 'ACN Ejem'];
  public worksAt = new FormControl();
  public privilege = [
    {
      section: 'tickets',
      module: [
        {
          label: 'Open tickets section',
          isChecked: true,
          icon: 'newspaper-outline',
          main: true,
        },
        {
          label: 'Create tickets',
          isChecked: false,
          icon: 'newspaper-outline'
        },
        {
          label: 'Cancel tickets',
          isChecked: false,
          icon: 'close'
        },
        {
          label: 'Edit tickets',
          isChecked: false,
          icon: 'create-outline'
        },
        {
          label: 'Authorize ticket',
          isChecked: false,
          icon: 'checkmark-done-outline'
        },
        {
          label: 'Add pictures',
          isChecked: false,
          icon: 'checkmark-done-outline'
        },
      ]
    },
    {
      section: 'inventory',
      module: [{
        label: 'Open inventory section',
        isChecked: true,
        icon: 'newspaper-outline',
        main: true,

      },
      // {
      //   label: 'Cancel tickets',
      //   isChecked: false,
      //   icon: 'close'
      // },
      // {
      //   label: 'Edit tickets',
      //   isChecked: false,
      //   icon: 'create-outline'
      // },
      // {
      //   label: 'Authorize ticket',
      //   isChecked: false,
      //   icon: 'checkmark-done-outline'
      // }
    ]
    },
    {
      section: 'invoices',
      module: [{
        label: 'Open invoices section',
        isChecked: true,
        icon: 'newspaper-outline',
        main: true,
      },
      {
        label: 'Create new invoice',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Cancel invoice',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Show details',
        isChecked: false,
        icon: 'create-outline'
      },
      {
        label: 'Dowonload PDF & XML',
        isChecked: false,
        icon: 'checkmark-done-outline'
      }]
    },
    {
      section: 'Contract',
      module: [{
        label: 'Open contract section',
        isChecked: true,
        icon: 'newspaper-outline',
        main: true,
      },
      {
        label: 'Create contract',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Accept contract',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Close contract',
        isChecked: false,
        icon: 'create-outline'
      },
      {
        label: 'Cancel contract',
        isChecked: false,
        icon: 'checkmark-done-outline'
      },
      {
        label: 'Authorize contract',
        isChecked: false,
        icon: 'checkmark-done-outline'
      },
    ]
    },
    {
      section: 'Treasury',
      module: [{
        label: 'Open treasury section',
        isChecked: true,
        icon: 'newspaper-outline',
        main: true,
      },
      {
        label: 'Cancel orders',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Authorize orders',
        isChecked: false,
        icon: 'create-outline'
      }
    ]
    },
    {
      section: 'directory',
      module: [{
        label: 'Open directory section',
        isChecked: true,
        icon: 'newspaper-outline',
        main: true,

      },
      {
        label: 'Delete client',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Edit client',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Add new client',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Hide email',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Hide phone',
        isChecked: false,
        icon: 'close'
      },
    ]
    },
    {
      section: 'empoyees',
      module: [{
        label: 'Open empoyees section',
        isChecked: true,
        icon: 'newspaper-outline',
        main: true,

      },
      {
        label: 'Hide salary',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Hide email',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Hide email',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Hide employment',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Hide work time',
        isChecked: false,
        icon: 'close'
      },
    ]
    },
    {
      section: 'users',
      module: [{
        label: 'Open users section',
        isChecked: true,
        icon: 'newspaper-outline',
        main: true,

      },
      {
        label: 'Add new user',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Add privilege',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Edit privilege',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Delete user',
        isChecked: false,
        icon: 'close'
      },
      {
        label: 'Edit user',
        isChecked: false,
        icon: 'close'
      },
    ]
    },
  ];
  public sticker: boolean;
  constructor() { }

  ngOnInit() {
  }
  public logScrolling = (event) => {
    console.log(event);
    
    const scrolling = event.detail.scrollTop;
    if (scrolling > 0) {
      this.sticker = true;
    } else {
      this.sticker = false;
    }
  }
}
