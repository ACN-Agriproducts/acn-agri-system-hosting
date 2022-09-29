import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { DocumentReference, Firestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  @ViewChild('name') nameField: ElementRef;

  public currentItem: DialogInvoiceItem;
  public filteredOptions: any;
  public itemList: DialogInvoiceItem[];
  public settingName: boolean = false;
  public settingNew: boolean = true;

  public currentCompany: string;
  public plantList: string[];
  public plantsObjList: Plant[];
  public productList: string[];
  public tankList: string[];

  constructor(
    private snack: SnackbarService,
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();

    InvoiceItem.getCollectionValueChanges(this.db, this.currentCompany).subscribe(list => {
      this.filteredOptions = this.itemList = list;
    });

    Plant.getPlantList(this.db, this.currentCompany)
    .then(plantObjList => {
      this.plantsObjList = plantObjList;
      this.plantList = plantObjList.map(plant => plant.ref.id);
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
  }

  public toggleSetName() {
    if (this.currentItem.name.trim() === "") return;
    if (this.settingName === false) this.nameField?.nativeElement.focus()
    this.settingName = !this.settingName;
  }

  public addItem(): void {
    this.settingNew = true;
    this.settingName = true;

    const newItem = this.createItem();
    this.currentItem = newItem;
    this.itemList.push(newItem);
  }

  public checkValidation(): boolean {
    for (const item of this.itemList ?? []) {
      console.log(item);
    }

    return true;
  }

  public validateItem() {

  }

  public reset() {
    this.currentItem = this.createItem();
    this.filteredOptions = this.itemList;
  }

  public createItem(): DialogInvoiceItem {
    return {
      affectsInventory: false,
      inventoryInfo: {
        info: [this.createInfo()]
      },
      name: "",
      price: null,
    };
  }

  public createInfo() {
    return {
      plant: "",
      product: "",
      tank: "",
      quantity: null
    };
  }

  public deleteItem(index: number): void {
    const infoList = this.currentItem.inventoryInfo.info;
    infoList.splice(index, 1);

    if (infoList.length === 0) infoList.push(this.createInfo());
  }

  public getTankList(index: number): string[] {
    const plant = this.plantsObjList.find(p => this.currentItem.inventoryInfo.info[index].plant == p.ref.id);
    return plant ? plant.inventoryNames : [];
  }
}

interface DialogInvoiceItem {
  affectsInventory: boolean;
  inventoryInfo: {
    info: {
      plant: string;
      product: string;
      quantity: number;
      tank: string;
    }[]
  };
  name: string;
  price: number;
}

/* interface DialogInvoiceItem2 {
  affectsInventory: boolean;
  inventoryInfo: DialogInventoryInfo
  name: string;
  price: number;
}

interface DialogInventoryInfo {
  info: Info[]
}

interface DialogInfo {
  plant: string;
  product: string;
  quantity: number;
  tank: string;
} */
