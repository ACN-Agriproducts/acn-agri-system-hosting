import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.page.html',
  styleUrls: ['./new-user.page.scss'],
})
export class NewUserPage implements OnInit {
  public privilege = [
    {
      section: 'tickets',
      module: [
        {
          label: 'Open tickets section',
          controlName: 'read',
          main: true,
        },
        {
          label: 'Request to void ticket',
          controlName: 'voidTicketRequest',
          icon: 'close'
        },
        {
          label: 'Authorize void ticket',
          controlName: 'voidTicketAccept',
          icon: 'checkmark-done-outline'
        },
        {
          label: 'Add documents',
          controlName: 'addDocument',
          icon: 'checkmark-done-outline'
        },
      ]
    },
    {
      section: 'inventory',
      module: [
        {
          label: 'Open inventory section',
          controlName: 'read',
          main: true,
        },
        {
          label: 'Move inventory',
          controlName: 'moveInventory'
        },
        {
          label: 'Zero out tank',
          controlName: 'zeroOutInventory'
        },
        {
          label: 'Add new inventory space',
          controlName: 'addSpace'
        },
        {
          label: 'Edit inventory space',
          controlName: 'editSpace'
        }
      ]
    },
    {
      section: 'invoices',
      module: [
        {
          label: 'Open invoices section',
          controlName: 'read',
          main: true,
        },
        {
          label: 'Create new invoice',
          controlName: 'createInvoice',
          icon: 'close'
        },
        {
          label: 'Cancel invoice',
          controlName: 'cancelInvoice',
          icon: 'close'
        },
        {
          label: 'Add proof of payment',
          controlName: 'addProofOfPayment'
        },
        {
          label: 'Edit invoice',
          controlName: 'editInvoice'
        },
        {
          label: 'Create Export Invoice',
          controlName: 'createExportInvoice'
        }
      ]
    },
    {
      section: 'contracts',
      module: [
        {
          label: 'Open contract section',
          controlName: 'read',
          icon: 'newspaper-outline',
          main: true,
        },
        {
          label: 'Create contract',
          controlName: 'createContract',
          icon: 'close'
        },
        {
          label: 'Accept contract',
          controlName: 'acceptContract',
          icon: 'close'
        },
        {
          label: 'Close contract',
          controlName: 'closeContract',
          icon: 'create-outline'
        },
        {
          label: 'Cancel contract',
          controlName: 'cancelContract',
          icon: 'checkmark-done-outline'
        }
      ]
    },
    {
      section: 'treasury',
      module: [
        {
          label: 'Open treasury section',
          controlName: 'read',
          icon: 'newspaper-outline',
          main: true,
        },
        {
          label: 'Create payment request',
          controlName: 'createRequest',
          icon: 'close'
        },
        {
          label: 'Complete payment orders',
          controlName: 'closeOrders',
          icon: 'create-outline'
        }
      ]
    },
    {
      section: 'directory',
      module: [
        {
          label: 'Open directory section',
          controlName: 'read',
          icon: 'newspaper-outline',
          main: true,

        },
        {
          label: 'Delete client',
          controlName: 'deleteContact',
          icon: 'close'
        },
        {
          label: 'Edit client',
          controlName: 'editContact',
          icon: 'close'
        },
        {
          label: 'Add new client',
          controlName: 'addContact',
          icon: 'close'
        },
        {
          label: 'Archive Contact',
          controlName: 'archiveContact'
        }
      ]
    },
    {
      section: 'employees',
      module: [
        {
          label: 'Open employees section',
          controlName: 'read',
          icon: 'newspaper-outline',
          main: true,

        },
        {
          label: 'Edit employees',
          controlName: 'editEmployeeInfo'
        },
      ]
    },
    {
      section: 'portfolio',
      module: [
        {
          label: 'Open portfolio section',
          controlName: 'read',
          main: true
        },
        {
          label: 'Edit pyramid', 
          controlName: 'editPyramid',
        },
        {
          label: 'Add record',
          controlName: 'addRecord'
        }
      ]
    },
  ];

  public userForm: FormGroup = this.fb.group({
    name: [, Validators.required],
    email: [, [Validators.required, Validators.email]],
    password: [,Validators.required],
    position: [],
    permissions: this.fb.group({
      admin: [false],
      tickets: this.fb.group({
        read: [false],
        voidTicketRequest: [false],
        voidTicketAccept: [false],
        addDocument: [false]
      }),
      inventory: this.fb.group({
        read: [false],
        zeroOutInventory:  [false],
        moveInventory: [false],
        addSpace: [false],
        editSpace: [false]
      }),
      invoices: this.fb.group({
        read: [false],
        createInvoice: [false],
        addProofOfPayment: [false],
        cancelInvoice: [false],
        editInvoice: [false],
        createExportInvoice: [false]
      }),
      contracts: this.fb.group({
        read: [false],
        createContract: [false],
        acceptContract: [false],
        closeContract: [false],
        cancelContract: [false],
      }),
      directory: this.fb.group({
        read: [false],
        archiveContact: [false],
        deleteContact: [false],
        addContact: [false],
        editContact: [false]
      }),
      treasury: this.fb.group({
        read: [false],
        createRequest: [false],
        closeOrders: [false]
      }),
      employees: this.fb.group({
        read: [false],
        editEmployeeInfo: [false]
      }),
      portfolio: this.fb.group({
        read: [false],
        editPyramid: [false],
        addRecord: [false]
      })


    })
  })
  public sticker: boolean;
  private currentCompany: string;


  constructor(
    private fb: FormBuilder,
    private localStorage: Storage,
    private fns: AngularFireFunctions,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.localStorage.get('currentCompany').then(val => {
      this.currentCompany = val;
    })
  }

  public submitForm() {
    console.log("Subimtting form...");

    let form = this.userForm.getRawValue();
    form.company = this.currentCompany;

    this.fns.httpsCallable('users-createUser')(form).subscribe(
      val => {
        this.navController.navigateForward('dashboard/users');
      },
      error => {
        console.log(error);
      }
    );
  }

  public logScrolling = (event) => {
    const scrolling = event.detail.scrollTop;
    if (scrolling > 0) {
      this.sticker = true;
    } else {
      this.sticker = false;
    }
  }
}
