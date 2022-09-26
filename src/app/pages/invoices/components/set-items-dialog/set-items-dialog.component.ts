import { Component, Inject, OnInit } from '@angular/core';
import { DocumentReference, Firestore } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { InvoiceItem } from '@shared/classes/invoice_item';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-set-items-dialog',
  templateUrl: './set-items-dialog.component.html',
  styleUrls: ['./set-items-dialog.component.scss'],
})
export class SetItemsDialogComponent implements OnInit {
  public currentItem: InvoiceItemDialogData;
  // public filteredOptions: Observable<string[]>;
  public filteredOptions: any;
  public settingNew: boolean = true;
  public itemList: InvoiceItemDialogData[];

  public currentCompany: string;
  public plantList: string[];
  public productList: string[];

  constructor(
    // @Inject(MAT_DIALOG_DATA) public data: any,
    private snack: SnackbarService,
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    /* if (this.data == null) {
      this.snack.open("Data could not be retrieved.", 'error');
      return;
    } */

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

    // this.filteredOptions = this.invoiceItemForm.valueChanges
    // .pipe(
    //   startWith(''),
    //   map(value => this._filter(value.name?.name ?? value.name ?? ''))
    // );

    this.currentItem = {
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

  public applyFilter(event: any) {
    console.log(event);
    console.log(this.filteredOptions);
    let value = '';
    try {
      value = event.toLowerCase();
    } catch (error) {
      value = event?.name.toLowerCase() ?? value;
    }
    this.filteredOptions = this.itemList.filter(item => item.name.toLowerCase().includes(value));
  }

  /* private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.data.filter(item => item.name.toLowerCase().includes(filterValue));
  } */

  public displayFn(event: any) {
    return event ?? "";
  }

  public displayInvoiceItem(event: any) {
    this.currentItem = event.option.value ?? this.currentItem;
  }

  // public displayInvoiceItem(event: any) {
  //   if (this.settingNew) {

  //   }

  //   const selectedItem = event.option.value;
  //   if (selectedItem == null) return;

  //   this.currentItem = selectedItem.ref;
  //   this.setProp('affectsInventory', selectedItem);
  //   this.setProp('name', selectedItem);
  //   this.setProp('price', selectedItem);
  //   this.setProp('inventoryInfo', selectedItem);
  // }

  // public setProp(key: string, item: any): void {
  //   if (key !== 'inventoryInfo') {
  //     this.invoiceItemForm.get(key).setValue(item[key]);
  //     this.data.find(item => item.ref.id === this.currentItem.id)[key] = item[key];
  //     console.log(this.data);
  //     return;
  //   }

  //   const infoList = this.invoiceItemForm.get([key, 'info']) as FormArray;
  //   infoList.clear();

  //   for (const info of item[key].info) {
  //     infoList.push(this.fb.group({
  //       plant: info.plant,
  //       product: info.product,
  //       quantity: info.quantity,
  //       tank: info.tank
  //     }));
  //   }
  // }

  // public setProps(item: any): void {
  //   for (const controlName in this.invoiceItemForm.controls) {
  //     if (controlName === 'inventoryInfo') this.setInventoryInfo(item);

  //   }
  // }

  public setInventoryInfo(item: any) {

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
