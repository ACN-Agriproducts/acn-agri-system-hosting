import { Component, OnInit } from '@angular/core';
import { doc, DocumentReference, Firestore, getDoc, updateDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { NavController } from '@ionic/angular';
import { User } from '@shared/classes/user';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.page.html',
  styleUrls: ['./new-user.page.scss'],
})
export class NewUserPage implements OnInit {
  public privilege: {
    section: string,
    module: {
      label: string,
      controlName: string,
      main?: boolean,
      icon?: string
    }[]
  }[] = [
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
        {
          label: 'Split Ticket',
          controlName: 'splitTicket',
        },
        {
          label: 'Add Ticket Discounts',
          controlName: 'setDiscounts'
        }
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
        },
        {
          label: 'View warehouse receipts',
          controlName: 'warehouseReceiptRead'
        },
        {
          label: 'Add new warehouse receipts',
          controlName: 'warehouseReceiptCreate'
        },
        {
          label: 'Update warehouse receipt status?',
          controlName: 'warehouseReceiptUpdate'
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
    // {
    //   section: 'portfolio',
    //   module: [
    //     {
    //       label: 'Open portfolio section',
    //       controlName: 'read',
    //       main: true
    //     },
    //     {
    //       label: 'Edit pyramid', 
    //       controlName: 'editPyramid',
    //     },
    //     {
    //       label: 'Add record',
    //       controlName: 'addRecord'
    //     }
    //   ]
    // },
    {
      section: 'prices',
      module: [
        {
          label: 'Edit prices',
          controlName: 'write',
          main: true
        },
        {
          label: 'Access purchase prices',
          controlName: 'purchasePrices',
        },
        {
          label: 'Access sales prices',
          controlName: 'salesPrices',
        },
      ]
    }
  ];

  public userForm: UntypedFormGroup = this.fb.group({
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
        addDocument: [false],
        splitTicket: [false]
      }),
      inventory: this.fb.group({
        read: [false],
        zeroOutInventory:  [false],
        moveInventory: [false],
        addSpace: [false],
        editSpace: [false],
        warehouseReceiptRead: [false],
        warehouseReceiptCreate: [false],
        warehouseReceiptUpdate: [false]
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
      }),
      prices: this.fb.group({
        salesPrices: [false],
        purchasePrices: [false],
        write: [false]
      })


    })
  })
  public sticker: boolean;

  public userId: string;
  public permissionRef: DocumentReference;

  constructor(
    private fb: UntypedFormBuilder,
    private session: SessionInfo,
    private fns: Functions,
    private navController: NavController,
    private route: ActivatedRoute,
    private db: Firestore,
    private snack: SnackbarService
  ) { }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');

    if(this.userId !== null) {
      httpsCallable(this.fns, "users-getUser")({
        company: this.session.getCompany(),
        userId: this.userId
      }).then(user => {
        this.userForm.get("name").setValue(user.data["name"]);
        this.userForm.get("email").setValue(user.data["email"]);
        this.userForm.get("position").setValue(user.data["employment"]);
      }).catch(error => {
        this.snack.open("Error: Could not retrieve user data", "error");
        console.error(error);
      });

      this.permissionRef = doc(this.db, "users", this.userId, "companies", this.session.getCompany());
      getDoc(this.permissionRef).then(permissionsSnapshot => {
        this.setPermissions(permissionsSnapshot.get("permissions"));
      }).catch(error => {
        this.snack.open("Error: Could not retrieve user permissions", "error");
        console.error(error);
      });
    }
  }

  public submitForm() {
    if(!this.userId){
      let form = this.userForm.getRawValue();
      form.company = this.session.getCompany();

      httpsCallable(this.fns, 'users-createUser')(form).then(
        val => {
          this.navController.navigateForward('dashboard/users');
        }
      ).catch(error => {
        this.snack.open("Error submitting user", "error");
        console.error(error);
      });
    }
    else {
      const permissions = this.userForm.get("permissions").getRawValue();
      
      //build update object
      const updateObject = { "permissions.admin": permissions.admin };
      for(let type in permissions) {
        if(type === "admin") continue;

        updateObject[`permissions.${type}`] = permissions[type];
      }

      updateDoc(this.permissionRef, updateObject).then(result => {
        this.navController.navigateForward("dashboard/users");
      }).catch(error => {
        this.snack.open("Error submitting user", "error");
        console.error(error);
      });
    }
  }

  public logScrolling = (event) => {
    const scrolling = event.detail.scrollTop;
    if (scrolling > 0) {
      this.sticker = true;
    } else {
      this.sticker = false;
    }
  }

  public setPermissions(permissions: any): void {
    const permissionsFormGroup = this.userForm.get("permissions") as FormGroup;

    for(let type in permissions) {
      if(type === "developer" || type == "owner") continue;

      if(type === "admin") { 
        permissionsFormGroup.get("admin").setValue(permissions.admin);
        continue;
      }

      const typeFormGroup = permissionsFormGroup.get(type) as FormGroup;
      for(let permission in permissions[type]) {
        typeFormGroup.get(permission).setValue(permissions[type][permission]);
      }
    }
  }
}
