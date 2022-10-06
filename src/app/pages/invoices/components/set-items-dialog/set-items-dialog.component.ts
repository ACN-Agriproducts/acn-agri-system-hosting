import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { DocumentReference, Firestore } from '@angular/fire/firestore';
import { FormArray, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { InvoiceItem } from '@shared/classes/invoice_item';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';

@Component({
  selector: 'app-set-items-dialog',
  templateUrl: './set-items-dialog.component.html',
  styleUrls: ['./set-items-dialog.component.scss'],
})
export class SetItemsDialogComponent implements OnInit {
  @ViewChild('itemForm') public itemForm: NgForm;

  private infoCount: number = 0;
  public infoMap: Map<number, DialogInfo> = new Map<number, DialogInfo>();
  public currentItem: DialogInvoiceItem;
  public filteredOptions: any;
  public infoArray: FormArray;
  public itemList: DialogInvoiceItem[];
  public settingName: boolean = false;
  public settingNew: boolean = true;

  public currentCompany: string;
  public plantNameList: string[];
  public plantObjList: Plant[];
  public productList: string[];
  public tankList: string[];

  constructor(
    private snack: SnackbarService,
    private db: Firestore,
    private session: SessionInfo,
    private confirm: ConfirmationDialogService,
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();

    InvoiceItem.getCollectionValueChanges(this.db, this.currentCompany).subscribe(list => {
      this.filteredOptions = this.itemList = list;
    });

    Plant.getPlantList(this.db, this.currentCompany)
    .then(plantObjList => {
      this.plantObjList = plantObjList;
      this.plantNameList = plantObjList.map(plant => plant.ref.id);
      return Product.getProductList(this.db, this.currentCompany);
    })
    .then(productObjList => {
      this.productList = productObjList.map(product => product.getName());
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });

    this.currentItem = this.createItem();
  }

  public applyFilter(event: any): void {
    const value = typeof event == "string" ? event.toLowerCase() : event?.name.toLowerCase();
    this.filteredOptions = this.itemList.filter(item => item.name.toLowerCase().includes(value));
  }

  public displayFn(event: any): string {
    return event?.name ?? "";
  }

  public displayInvoiceItem(event: any): void {
    this.currentItem = event.option.value ?? this.currentItem;
    this.setMap();
  }

  public toggleSetName(): void {
    if (this.currentItem.name.trim() === "") return;
    this.settingName = !this.settingName;
  }

  public addItem(): void {
    if (this.itemForm.control.invalid) {
      this.itemForm.control.markAllAsTouched();
      return;
    }

    this.settingNew = this.settingName = true;
    this.currentItem = this.createItem();
    this.addInfo();
    this.itemList.push(this.currentItem);
  }
  
  public createItem(): DialogInvoiceItem {
    return {
      affectsInventory: false,
      inventoryInfo: {
        info: []
      },
      name: "",
      price: null,
    };
  }

  public addInfo(): void {
    this.currentItem.inventoryInfo.info.push(this.createInfo());
    this.setMap();
  }
  
  public createInfo() {
    return {
      plant: "",
      product: "",
      tank: "",
      quantity: null
    };
  }

  public reset(): void {
    if (this.itemForm.control.invalid) {
      this.itemForm.control.markAllAsTouched();
      return;
    }

    this.currentItem = this.createItem();
    this.filteredOptions = this.itemList;
  }

  public async deleteItem(): Promise<void> {
    if (!await this.confirm.openDialog("delete this Invoice Item")) return;
    this.itemList.splice(this.itemList.indexOf(this.currentItem), 1);
    this.reset();
  }
  
  public deleteInfo(index: number): void {
    console.log("deleteInfo");
    const infoList = this.currentItem.inventoryInfo.info;
    infoList.splice(index, 1);
    this.setMap();

    if (infoList.length === 0) infoList.push(this.createInfo());
  }

  public getTankList(index: number): string[] {
    const plant = this.plantObjList.find(p => this.currentItem.inventoryInfo.info[index].plant == p.ref.id);
    return plant ? plant.inventoryNames : [];
    // return plant?.inventoryNames ?? [];
  }

  public nameIsEditable(): boolean {
    const name = this.currentItem?.name?.trim() ?? '';
    return typeof this.currentItem === 'object' && name !== '' ? true : false;
  }

  public itemSelected(): boolean {
    if (typeof this.currentItem === 'string') return false;
    const name = this.currentItem?.name?.trim() ?? '';
    return name !== '';
  }

  public setMap() {
    this.infoMap.clear();
    this.currentItem.inventoryInfo.info.forEach((info, index) => {
      this.infoMap.set(index, info);
    });
  }

  public test() {
    console.log(this.currentItem.inventoryInfo.info);
    console.log(this.itemForm.controls);
    console.log(this.infoMap);
  }

  // public validateAll(): { [key: string]: boolean }[] {
  //   const infoValidity = this.currentItem.inventoryInfo.info.map(info => this.validateInfo(info));
  //   return infoValidity;
  // }

  // public validateInfo(info: {
  //   plant: string;
  //   product: string;
  //   quantity: number;
  //   tank: string;
  // }): { [key: string]: boolean } {
  //   const valueValidity = {};

  //   for (const key in info) {
  //     valueValidity[key] = info[key] != null && info[key] !== '';
  //   }
  //   return valueValidity;
  // }
}

interface DialogInvoiceItem {
  affectsInventory: boolean;
  inventoryInfo: {
    info: DialogInfo[];
  }
  name: string;
  price: number;
}

/* interface DialogInvoiceItem {
  affectsInventory: boolean;
  inventoryInfo: DialogInventoryInfo
  name: string;
  price: number;
}

interface DialogInventoryInfo {
  info: DialogInfo[]
} */

interface DialogInfo {
  plant: string;
  product: string;
  quantity: number;
  tank: string;
}
