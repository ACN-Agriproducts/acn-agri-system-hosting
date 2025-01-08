import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '@shared/classes/product';

@Component({
  selector: 'app-edit-inv-dialog',
  templateUrl: './edit-inv-dialog.component.html',
  styleUrls: ['./edit-inv-dialog.component.scss'],
})
export class EditInvDialogComponent implements OnInit {
  public response = {
    quantity: 0,
    newProduct: null
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    productList: Product[],
    currentProduct: string
  }) { }

  ngOnInit() {}

}
