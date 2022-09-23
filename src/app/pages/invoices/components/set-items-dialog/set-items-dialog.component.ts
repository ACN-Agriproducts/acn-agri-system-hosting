import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-set-items-dialog',
  templateUrl: './set-items-dialog.component.html',
  styleUrls: ['./set-items-dialog.component.scss'],
})
export class SetItemsDialogComponent implements OnInit {
  public invoiceItemForm: FormGroup;
  public filteredOptions: Observable<string[]>;
  public settingNew: boolean = true;

  list = [1,2,3,4];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snack: SnackbarService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    if (this.data == null) this.snack.open("Item list could not be retrieved.", 'error');

    this.invoiceItemForm = this.fb.group({
      affectsInventory: false,
      inventoryInfo: this.fb.group({
        info: this.fb.array([])
      }),
      name: '',
      price: [, Validators.required],
    });

    this.filteredOptions = this.invoiceItemForm.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value.name?.name ?? ''))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.data.filter(item => item.name.toLowerCase().includes(filterValue));
  }

  public displayInvoiceItem(event: any) {
    const selectedItem = event.option.value;

    this.setProp('affectsInventory', selectedItem);
    this.setProp('name', selectedItem);
    this.setProp('price', selectedItem);
    this.setProp('inventoryInfo', selectedItem);
  }

  public setProp(key: string, item: any): void {
    if (key !== 'inventoryInfo') {
      this.invoiceItemForm.get(key).setValue(item[key]);
      return;
    }

    const infoList = this.invoiceItemForm.get([key, 'info']) as FormArray;
    infoList.clear();
    for (let info of item[key].info) {
      infoList.push(this.fb.group({
        plant: info.plant,
        product: info.product,
        quantity: info.quantity,
        tank: info.tank
      }));
    }
  }
}

interface InvoiceItem {
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

interface InvoiceItem2 {
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
