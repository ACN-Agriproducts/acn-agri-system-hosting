import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProductAccount } from '../../contract-payment-reports.page';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent implements OnInit {
  @Input() data: ProductAccount; 
  public tableData: TableData[];

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    const tempTableData: TableData[] = [{
      name: "Purchase",
      series: [{
        name: "Paid",
        value: this.data.purchase.paid,
      }, {
        name: "To Pay",
        value: this.data.purchase.pendingToPay
      }]
    }, {
      name: "Sale",
      series: [{
        name: "Paid",
        value: this.data.sale.paid,
      }, {
        name: "To Pay",
        value: this.data.sale.pendingToPay
      }]
    }];


    this.tableData = tempTableData;
  }

  openContractsDialog() {
    this.dialog.open(ProductDialogComponent, {
      data: this.data
    });
  }
}

interface TableData {
  name: string,
  series: {
    name: string,
    value: number;
  }[]
}
