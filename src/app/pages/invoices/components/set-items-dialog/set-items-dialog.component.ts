import { Component, Inject, OnInit } from '@angular/core';
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
  public currentItem: InvoiceItemDialogData;
  public filteredOptions: any;
  public itemList: InvoiceItemDialogData[];
  public settingName: boolean = false;
  public settingNew: boolean = true;

  public currentCompany: string;
  public plantList: string[];
  public productList: string[];

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
      this.plantList = plantObjList.map(plant => plant.ref.id);
      return Product.getProductList(this.db, this.currentCompany);
    })
    .then(productObjList => {
      this.productList = productObjList.map(product => product.getName());
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });

    this.currentItem = this.defaultItem();
  }

  public applyFilter(event: any) {
    const value = typeof event == "string" ? event.toLowerCase() : event?.name.toLowerCase();
    this.filteredOptions = this.itemList.filter(item => item.name.toLowerCase().includes(value));
  }

  public displayFn(event: any) {
    return event?.name ?? "";
  }

  public displayInvoiceItem(event: any) {
    this.currentItem = event.option.value ?? this.currentItem;
  }

  public setNew() {
    this.settingNew = true;
    this.settingName = true;
    this.itemList.push(this.defaultItem());
    this.currentItem = this.itemList[this.itemList.length - 1];
  }

  public reset() {
    this.currentItem = this.defaultItem();
    this.filteredOptions = this.itemList;
  }

  public defaultItem():InvoiceItemDialogData {
    return {
      affectsInventory: false,
      inventoryInfo: {
        info: [{
          plant: "",
          product: "",
          tank: "",
          quantity: null
        }]
      },
      name: "",
      price: null,
    };
  }
}

interface InvoiceItemDialogData {
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

interface InvoiceItemDialogData2 {
  affectsInventory: boolean;
  inventoryInfo: InventoryInfo
  name: string;
  price: number;
}

interface InventoryInfo {
  info: Info[]
}

interface Info {
  plant: string;
  product: string;
  quantity: number;
  tank: string;
}
