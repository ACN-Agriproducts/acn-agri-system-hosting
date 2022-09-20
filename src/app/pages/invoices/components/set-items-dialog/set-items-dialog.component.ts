import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-set-items-dialog',
  templateUrl: './set-items-dialog.component.html',
  styleUrls: ['./set-items-dialog.component.scss'],
})
export class SetItemsDialogComponent implements OnInit {
  public currentItem: any = null;
  public invoiceItemForm: FormGroup;
  public filteredOptions: Observable<string[]>;
  public settingNew: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snack: SnackbarService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    console.log(this.data);

    this.invoiceItemForm = this.fb.group({
      affectsInventory: false,
      inventoryInfo: [],
      name: '',
      price: [, Validators.required],
    });

    this.filteredOptions = this.invoiceItemForm.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value.name ?? ''))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.data
    .map(item => item.name)
    .filter(option => option.toLowerCase().includes(filterValue));
  }

  public editName() {
    console.log("Edit Name");
  }
}
