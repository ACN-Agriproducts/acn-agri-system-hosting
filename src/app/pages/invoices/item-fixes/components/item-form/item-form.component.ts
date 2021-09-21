import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss'],
})
export class ItemFormComponent implements OnInit {
  @Input() item: any;
  @Input() invoiceRef: DocumentReference;
  @Input() index: number;
  @Input() productList: any[];
  @Input() plantsList: any[];
  public storageList: any;

  public itemForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private db: AngularFirestore,
    private navController: NavController
  ) {}

  ngOnInit() {
    this.itemForm = this.fb.group({
      details: [],
      name: [{value: this.item.name, disabled: true}, Validators.required],
      quantity: [{value: this.item.quantity, disabled: true}, Validators.required],
      price: [{value: this.item.price, disabled: true}, Validators.required],
      inventoryInfo: this.fb.group({
        info: this.fb.array([])
      }),
      affectsInventory: [this.item.affectsInventory, Validators.required],
      needsAttention: [false, Validators.required]
    })

    if (this.item.details) {
      const details = this.itemForm.get("details") as FormArray;
      details.push(this.createDetail(this.item.details));
    }

    const inventoryInfo = this.itemForm.get(['inventoryInfo', 'info']) as FormArray;
    if (Array.isArray(this.item.inventoryInfo.info)) {
      for(const info of this.item.inventoryInfo.info) {
        inventoryInfo.push(this.createInventoryInfo(info));
      }
    }
    else{
      inventoryInfo.push(this.createInventoryInfo(this.item.inventoryInfo));
    }

    this.storageList = {};

    for(const plant of this.plantsList) {
      this.storageList[plant.id] = plant.data().inventory;
    }
  }

  createDetail(detail: string = ""): FormControl{
    return this.fb.control(detail, Validators.required);
  }

  addInventoryInfo(): void{
    const inventory = this.itemForm.get(["inventoryInfo", "info"]) as FormArray;
    inventory.push(this.createInventoryInfo());
  }

  createInventoryInfo(info?: any): FormGroup{
    if(info == null) {
      info = {
        product: null,
        quantiy: null,
        plant: null,
        tank: null
      }
    }

    return this.fb.group({
      product: [info.product],
      quantity: [info.quantity],
      plant: [info.plant],
      tank: [info.tank]
    })
  }

  getInfo(index: number): any {
    return this.itemForm.getRawValue().inventoryInfo.info[index];
  }

  addInvButton(): void {
    if(this.itemForm.value.affectsInventory) {
      const inventoryInfo = this.itemForm.get(['inventoryInfo', "info"]) as FormArray;
      inventoryInfo.push(this.createInventoryInfo());
    }
  }

  deleteInfo(index: number) {
    const inventoryInfo = this.itemForm.get(['inventoryInfo', 'info']) as FormArray;
    inventoryInfo.removeAt(index);
  }

  submitButton(): void {
    let item = this.itemForm.getRawValue();
    if(!item.affectsInventory) {
      item.inventoryInfo.info = [];
    }

    this.invoiceRef.get().then(async (invoiceDoc) => {
      if(!invoiceDoc.exists) {
        throw "Document does not exist";
      }

      let invoiceData = invoiceDoc.data();
      invoiceData.items[this.index] = item;

      await this.invoiceRef.set(invoiceData);

      this.navController.navigateForward('dashboard/invoices');

    })
  }
}