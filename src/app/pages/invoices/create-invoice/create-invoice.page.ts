import { Component, OnInit } from '@angular/core';
import { addDoc, Firestore } from '@angular/fire/firestore';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, AbstractControlOptions, UntypedFormControl } from '@angular/forms';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Company } from '@shared/classes/company';
import { Invoice } from '@shared/classes/invoice';
import { InvoiceItem } from '@shared/classes/invoice_item';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';
import { Subscription } from 'rxjs';
import { PrintableInvoiceComponent } from '../components/printable-invoice/printable-invoice.component';

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.page.html',
  styleUrls: ['./create-invoice.page.scss'],
})
export class CreateInvoicePage implements OnInit {

  public currentCompany: string;
  public plantsList: Plant[];
  public itemsList: any[];
  public productsList: Product[];
  public userPermissions: any[];
  public storageList: any;

  public id: number;
  public allItems: any[];
  public total: number = 0;
  public ready: boolean = false;
  
  invoiceForm: UntypedFormGroup;

  private currentSubs: Subscription[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private db: Firestore,
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

      tempSub = Company.getCompanyValueChanges(this.db, this.currentCompany).subscribe(val => {
        this.id = val.nextInvoice;
      })
      this.currentSubs.push(tempSub);

      Plant.getPlantList(this.db, this.currentCompany).then(list => {
        this.plantsList = list;
        this.storageList = {};

        for(const plant of list) {
          this.storageList[plant.ref.id] = plant['inventory'];
        }
      })    

      
      tempSub = InvoiceItem.getCollectionValueChanges(this.db, this.currentCompany).subscribe(list => {
        this.itemsList = list;
      })
      this.currentSubs.push(tempSub)

      Product.getProductList(this.db, this.currentCompany).then(list => {
        this.productsList = list;
      });
    })
  }

  createItem(): UntypedFormGroup{
    return this.fb.group({
      details: [],
      name: [, Validators.required],
      quantity: [0, Validators.required],
      price: [, Validators.required],
      affectsInventory: [false, Validators.required],
      inventoryInfo: this.fb.group({
        info: this.fb.array([])
      }),
    })
  }

  addItem(){
    const items = this.invoiceForm.get("items") as UntypedFormArray;
    items.push(this.createItem());
  }

  deleteItem(i: number) {
    const items = this.invoiceForm.get("items") as UntypedFormArray;
    
    if(items.length <= 1 || items.length !< items.length) {
      return;
    }

    items.removeAt(i);
  }

  createInventoryInfo(): UntypedFormGroup {
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
    const infos = this.invoiceForm.get(['items', index, 'inventoryInfo', 'info']) as UntypedFormArray;
    infos.push(this.createInventoryInfo());
  }

  deleteInventoryInfo(invIndex: number, infoIndex: number): void {
    const infos = this.invoiceForm.get(['items', invIndex, 'inventoryInfo', 'info']) as UntypedFormArray;
    infos.removeAt(infoIndex);
  }

  ifAffectsInventory(formGroup: UntypedFormGroup) {
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
      console.log("Item not found");
      return;
    }

    const formItem = this.invoiceForm.get(["items", index]) as UntypedFormControl;
    formItem.get(["inventoryInfo", "info"]).setValue([]);

    formItem.get("name").setValue(item.name);
    formItem.get("price").setValue(item.price);
    formItem.get("affectsInventory").setValue(item.affectsInventory);
    
    const inventoryInfo = formItem.get(["inventoryInfo", "info"]) as UntypedFormArray;
    while(inventoryInfo.length > 0) {
      inventoryInfo.removeAt(0);
    }
    
    for(const info of item.inventoryInfo.info){
      inventoryInfo.push(this.fb.group({
        product: info.product,
        quantity: info.quantity,
        plant: info.plant,
        tank: info.tank
      }))
    }
  }

  public getInfo(itemIndex:number, infoIndex:number) {
    const form = this.invoiceForm.getRawValue();

    return form.items[itemIndex].inventoryInfo.info[infoIndex];
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
    invoice.needsAttention = true;

    addDoc(Invoice.getCollectionReference(this.db, this.currentCompany), invoice);

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
