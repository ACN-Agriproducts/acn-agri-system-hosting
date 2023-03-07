import { Component, OnInit, ViewChild } from '@angular/core';
import { doc, Firestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { MatSelectionList } from '@angular/material/list';
import { MatDrawer } from '@angular/material/sidenav';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { info, inventoryInfo, InvoiceItem } from '@shared/classes/invoice_item';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';

@Component({
  selector: 'app-set-items-dialog',
  templateUrl: './set-items-dialog.component.html',
  styleUrls: ['./set-items-dialog.component.scss'],
})
export class SetItemsDialogComponent implements OnInit {
  @ViewChild('itemForm') private itemForm: NgForm;
  @ViewChild('drawer') private drawer: MatDrawer;
  @ViewChild('selectList') private selectList: MatSelectionList;

  public currentItem: DialogInvoiceItem = null;
  public itemList: DialogInvoiceItem[];

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
      this.itemList = list;
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
  }

  public selectItem(event: any): void {
    if (!this.formValid()) {
      this.showInvalid();
      return;
    }
    this.currentItem = event.options[0]?._value ?? this.currentItem;
    this.drawer.close();
  }
  
  public addItem(): void {
    if (this.itemSelected() && !this.formValid()) {
      this.showInvalid();
      return;
    }

    this.currentItem = this.createItem();
    this.addInfo();
    this.itemList.push(this.currentItem);
  }

  public showInvalid() {
    this.itemForm.form.markAllAsTouched();
    this.snack.open("Please fill in required * fields", 'error');
    this.selectList.deselectAll();
  }
  
  public createItem(): InvoiceItem {
    const item = new InvoiceItem(doc(InvoiceItem.getCollectionReference(this.db, this.currentCompany)));

    item.affectsInventory = false;
    item.inventoryInfo = new inventoryInfo([]);
    item.name = "";
    item.price = null;

    return item;
  }

  public async deleteItem(): Promise<void> {
    if (!await this.confirm.openDialog("delete this Invoice Item")) return;
    this.itemList.splice(this.itemList.indexOf(this.currentItem), 1);
    this.currentItem = null;
    this.drawer.open();
  }

  public addInfo(): void {
    this.currentItem.inventoryInfo.info.push(this.createInfo());
  }
  
  public createInfo(): info {
    return new info({
      plant: "",
      product: "",
      tank: "",
      quantity: null
    });
  }

  public deleteInfo(index: number): void {
    const infoList = this.currentItem.inventoryInfo.info;
    infoList.splice(index, 1);

    if (infoList.length === 0) {
      infoList.push(this.createInfo());
    }
  }

  public getTankList(index: number): string[] {
    const plant = this.plantObjList.find(p => this.currentItem.inventoryInfo.info[index].plant == p.ref.id);
    return plant?.inventoryNames ?? [];
  }

  public itemSelected(): boolean {
    return (this.currentItem == null || typeof this.currentItem === 'string') ? false : true;
  }

  public formValid(): boolean {
    return (this.itemForm?.valid ?? true) ? true : false;
  }
}

export interface DialogInvoiceItem {
  affectsInventory: boolean;
  inventoryInfo: {
    info: DialogInfo[];
  }
  name: string;
  price: number;
}

interface DialogInfo {
  plant: string;
  product: string;
  quantity: number;
  tank: string;
}
