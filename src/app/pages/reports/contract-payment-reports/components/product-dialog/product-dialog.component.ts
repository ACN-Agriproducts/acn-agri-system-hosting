import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contract } from '@shared/classes/contract';
import { ProductAccount } from '../../contract-payment-reports.page';

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss'],
})
export class ProductDialogComponent implements OnInit {
  purchaseContracts: Contract[];
  saleContracts: Contract[];
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ProductAccount,
    public dialogRef: MatDialogRef<ProductDialogComponent>
  ) { }

  ngOnInit() {
    this.purchaseContracts = this.data.contracts.filter(c => c.tags.includes('purchase'));
    this.saleContracts = this.data.contracts.filter(c => c.tags.includes('sale'));
  }
}
