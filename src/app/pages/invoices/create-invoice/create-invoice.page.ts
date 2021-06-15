import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { PrintableInvoiceComponent } from '../components/printable-invoice/printable-invoice.component';

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.page.html',
  styleUrls: ['./create-invoice.page.scss'],
})
export class CreateInvoicePage implements OnInit {

  public currentCompany: string;
  public plantsList: any[];
  public itemsList: any[];
  public productsList: any[];
  public userPermissions: any[];
  public storageList: any[];

  public id: number;
  public allItems: any[];
  public total: number = 0;
  public ready: boolean = false;
  
  invoiceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private db: AngularFirestore,
    private localStorage: Storage,
    private navController: NavController,
    private modalController: ModalController,
    private alertController: AlertController
    ) {}

  ngOnInit() {
    this.invoiceForm = this.fb.group({
      seller: this.fb.group({
        name: [{value: "ACN Agriproducts, LLC.", disabled: true}, Validators.required],
        street: [{value: "1512 Rancho Toluca Road", disabled: true}, Validators.required],
        zip:  [{value: "78570", disabled: true}, Validators.required],
        city:  [{value: "Weslaco", disabled: true}, Validators.required],
        state:  [{value: "TX", disabled: true}, Validators.required],
        country:  [{value: "US", disabled: true}, Validators.required],
        phone:  [{value: "(956) 363-2205", disabled: true}, Validators.required]
      }),
      buyer: this.fb.group({
        name: [, Validators.required],
        street: [],
        zip:  [],
        city:  [, Validators.required],
        state:  [, Validators.required],
        country:  [, Validators.required],
        phone:  []
      }),
      date: [new Date()],
      items: this.fb.array([this.createItem()])
    })

    this.ready = true;

    this.localStorage.get('user').then(val => {
      this.userPermissions = val.currentPermissions;
    })

    this.localStorage.get('currentCompany').then(company => {
      this.currentCompany = company;

      this.db.doc(`companies/${this.currentCompany}`).valueChanges().subscribe( val => {
        this.id = val['nextInvoice'];
      })

      this.db.collection(`companies/${this.currentCompany}/plants`).valueChanges({idField: "name"}).subscribe(list => {
        this.plantsList = list;
      })

      this.db.collection(`companies/${this.currentCompany}/invoiceItems`).valueChanges({idField: "docId"}).subscribe(list => {
        this.itemsList = list;
      })

      this.db.collection(`companies/${this.currentCompany}/products`).valueChanges({idField: "name"}).subscribe(list => {
        this.productsList = list;
      })
    })
  }

  createItem(): FormGroup{
    return this.fb.group({
      name: [, Validators.required],
      quantity: [0, Validators.required],
      price: [, Validators.required],
      affectsInventory: [false, Validators.required],
      inventoryInfo: this.fb.group({
        product: [],
        quantity: [],
        plant: [],
        tank: []
      }, 
      {
        validators: [this.ifAffectsInventory]
      })
    })
  }

  addItem(){
    const items = this.invoiceForm.get("items") as FormArray;
    items.push(this.createItem());
  }

  deleteItem(i: number) {
    const items = this.invoiceForm.get("items") as FormArray;
    
    if(items.length <= 1 || items.length !< items.length) {
      return;
    }

    items.removeAt(i);
  }

 ifAffectsInventory(formGroup: FormGroup) {
    if(!formGroup.parent) {
      return null;
    }
    
    let errors: any = {};
    let conError: boolean = false;

    if(formGroup.parent.value.affectsInventory) {
      if(!formGroup.value.product) {
        errors.requiredProduct = true;
        conError = true;
      }
      if(!formGroup.value.quantity) {
        errors.requiredQuantity = true;
        conError = true;
      }
      if(!formGroup.value.plant) {
        errors.requiredPlant = true;
        conError = true;
      }
      if(!formGroup.value.tank) {
        errors.requiredTank = true;
        conError = true;
      }

      return conError? errors:null
    }
  }

  itemSelectChange(value: string, index: number) {
    if(value == "none"){
      return;
    }

    let item = this.itemsList.find(i => i.name == value);

    if(item == null){
      console.log(this.itemsList);
      console.log(value);
      console.log("Item not found");
      return;
    }

    let itemArray = this.invoiceForm.get('items') as FormArray;
    let formItem = itemArray.get(index.toString());
    formItem.get("name").setValue(item.name);
    formItem.get("price").setValue(item.price);
    formItem.get("affectsInventory").setValue(item.affectsInventory);
    formItem.get("inventoryInfo").get("product").setValue(item.inventoryInfo.product);
    formItem.get("inventoryInfo").get("quantity").setValue(item.inventoryInfo.quantity);
    formItem.get("inventoryInfo").get("plant").setValue(item.inventoryInfo.plant);
    formItem.get("inventoryInfo").get("tank").setValue(item.inventoryInfo.tank);

    this.plantSelectChange(item.inventoryInfo.plant, index);

    console.log(this.invoiceForm.getRawValue())
  }

  plantSelectChange(value: string, index: number) {
    let plant = this.plantsList.find(p => p.name == value);
    this.storageList = plant.inventory;
  }

  async submitButton() {
    let doc = this.invoiceForm.getRawValue();
    this.total = 0;
    
    doc.items.forEach(item => {
      this.total += (item.quantity * item.price);
    });

    console.log(this.total)

    let alert = await this.alertController.create({
      header: "Alert",
      message: "Are you sure?",
      buttons: [
        {
          text: "cancel",
          role: 'cancel',
        },
        {
          text:"Submit",
          handler: async () => {
            await alert.dismiss();
            this.acceptedInvoice();
          }
        }]
    })

    await alert.present();
  }

  async acceptedInvoice() {
    let invoice = this.invoiceForm.getRawValue();
    invoice.total = this.total;
    invoice.status = "pending";
    invoice.id = this.id;

    this.db.collection(`companies/${this.currentCompany}/invoices`).add(invoice);

    let modal = await this.modalController.create({
      component: PrintableInvoiceComponent,
      componentProps: {
        seller: invoice.seller,
        buyer: invoice.buyer,
        id: this.id,
        date: invoice.date,
        items: invoice.items,
        total: this.total
      },
      mode: 'md'
    });

    await modal.present();

    window.onafterprint = () => {
      this.navController.navigateForward('dashboard/invoices');
      modal.dismiss();
    }
    window.print();
  }
}
