import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, AbstractControlOptions, FormControl } from '@angular/forms';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
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
  public storageList: any;

  public id: number;
  public allItems: any[];
  public total: number = 0;
  public ready: boolean = false;
  
  invoiceForm: FormGroup;

  private currentSubs: Subscription[] = [];

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
      items: this.fb.array([this.createItem()]),
    })

    this.ready = true;

    this.localStorage.get('user').then(val => {
      this.userPermissions = val.currentPermissions;
    })

    this.localStorage.get('currentCompany').then(company => {
      this.currentCompany = company;
      var tempSub;

      tempSub = this.db.doc(`companies/${this.currentCompany}`).valueChanges().subscribe( val => {
        this.id = val['nextInvoice'];
      })
      this.currentSubs.push(tempSub);

      const sub = this.db.collection(`companies/${this.currentCompany}/plants`).valueChanges({idField: "name"}).subscribe(list => {
        this.plantsList = list;
        this.storageList = {};

        for(const plant of list) {
          this.storageList[plant.name] = plant['inventory'];
        }

        sub.unsubscribe();
      })
      

      tempSub = this.db.collection(`companies/${this.currentCompany}/invoiceItems`).valueChanges({idField: "docId"}).subscribe(list => {
        this.itemsList = list;
      })
      this.currentSubs.push(tempSub)

      const sub2 = this.db.collection(`companies/${this.currentCompany}/products`).valueChanges({idField: "name"}).subscribe(list => {
        this.productsList = list;
        sub2.unsubscribe();
      })
    })
  }

  createItem(): FormGroup{
    return this.fb.group({
      details: this.fb.array([this.fb.control('')]),
      name: [, Validators.required],
      quantity: [0, Validators.required],
      price: [, Validators.required],
      affectsInventory: [false, Validators.required],
      inventoryInfo: this.fb.array([]),
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

  createInventoryInfo(): FormGroup {
    const options: AbstractControlOptions = {
      validators: this.ifAffectsInventory
    }

    return this.fb.group({
      product: [],
      quantity: [],
      plant: [],
      tank: []
    },
      options
    );
  }

  addInventoryInfo(index: number): void {
    console.log(index);
    const infos = this.invoiceForm.get(['items', index, 'inventoryInfo']) as FormArray;
    console.log(infos)
    infos.push(this.createInventoryInfo());
    console.log(infos)
  }

  deleteInventoryInfo(invIndex: number, infoIndex: number): void {
    const infos = this.invoiceForm.get(['items', invIndex, 'inventoryInfo']) as FormArray;
    infos.removeAt(infoIndex);
  }

 ifAffectsInventory(formGroup: FormGroup) {
    if(!formGroup.parent) {
      return null;
    }
    
    let errors: any = {};
    let conError: boolean = false;

    if(formGroup.parent.parent.value.affectsInventory) {
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

    const formItem = this.invoiceForm.get(['items', index]) as FormControl;
    formItem.get('inventoryInfo').setValue([]);

    formItem.get("name").setValue(item.name);
    formItem.get("price").setValue(item.price);
    formItem.get("affectsInventory").setValue(item.affectsInventory);
    
    const inventoryInfo = formItem.get("inventoryInfo") as FormArray;
    while(inventoryInfo.length > 0) {
      inventoryInfo.removeAt(0);
    }
    
    for(const info of item.inventoryInfo){
      inventoryInfo.push(this.fb.group({
        product: info.product,
        quantity: info.quantity,
        plant: info.plant,
        tank: info.tank
      }))
    }
  }

  async submitButton() {
    let doc = this.invoiceForm.getRawValue();
    this.total = 0;
    
    doc.items.forEach(item => {
      this.total += (item.quantity * item.price);
      if(!item.affectsInventory) {
        item.inventoryInfo = [];
      }
    });

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
