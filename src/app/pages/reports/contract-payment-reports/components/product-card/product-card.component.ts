import { Component, Input, OnInit } from '@angular/core';
import { ProductAccount } from '../../contract-payment-reports.page';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent implements OnInit {
  @Input() data: ProductAccount; 
  public tableData: TableData[];

  constructor() { }

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
    console.log("test");
  }
}

interface TableData {
  name: string,
  series: {
    name: string,
    value: number;
  }[]
}
