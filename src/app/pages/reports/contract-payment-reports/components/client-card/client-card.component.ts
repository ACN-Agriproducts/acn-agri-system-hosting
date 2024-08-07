import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClientAccount } from '../../contract-payment-reports.page';
import { ClientDialogComponent } from '../client-dialog/client-dialog.component';

@Component({
  selector: 'app-client-card',
  templateUrl: './client-card.component.html',
  styleUrls: ['./client-card.component.scss'],
})
export class ClientCardComponent implements OnInit {
  @Input() data: ClientAccount; 
  public tableData: TableData[];

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    const tempTableData: TableData[] = [];

    if(this.data.purchase.paid + this.data.purchase.pendingToPay > 0) {
      tempTableData.push({
        name: "Purchase",
        series: [{
          name: "Paid",
          value: this.data.purchase.paid
        }, {
          name: "Pending",
          value: this.data.purchase.pendingToPay
        }]
      });
    }

    if(this.data.sale.paid + this.data.sale.pendingToPay > 0) {
      tempTableData.push({
        name: "Sales",
        series: [{
          name: "Paid",
          value: this.data.sale.paid
        }, {
          name: "Pending",
          value: this.data.sale.pendingToPay
        }]
      });
    }

    this.tableData = tempTableData;
  }

  openContractsDialog() {
    this.dialog.open(ClientDialogComponent, {
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
