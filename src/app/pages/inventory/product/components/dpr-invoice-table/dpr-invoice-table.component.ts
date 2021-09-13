import { Component, OnInit, Input } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';

@Component({
  selector: 'app-dpr-invoice-table',
  templateUrl: './dpr-invoice-table.component.html',
  styleUrls: ['./dpr-invoice-table.component.scss'],
})
export class DprInvoiceTableComponent implements OnInit {
  @Input() invoiceList: DocumentReference[];
  @Input() bushelWeight: number = 1;
  @Input() productName: string;

  public invoiceData: any[];
  public displayedColumns: string[] = ['id', 'client', 'net'];

  public ready: boolean = false;
  constructor() { }

  ngOnInit() {
    this.invoiceData = new Array<any>(this.invoiceList.length);
    let counter = 0;

    if(this.invoiceData.length == 0) {
      this.ready = true;
    }

    this.invoiceList.forEach((invoice, index) => {
      invoice.get().then(val => {
        // Add invoice data to list
        const data = val.data();
        let formatedData = {
          id: data.id,
          name: data.buyer.name,
          total: 0,
          status: data.status
        };
        for(const item of data.items) {
          if(item.affectsInventory && item.inventoryInfo.product == this.productName) {
            formatedData.total += item.inventoryInfo.quantity * item.quantity;
          }
        }
        this.invoiceData[index] = formatedData;
        
        counter++;
        
        if(counter){
          this.ready = true;
        }
      })
    })
  }

  getTotalWeight(): number {
    let total: number = 0;

    for(const x of this.invoiceData) {
      if(x.status != "canceled") {
        total += x.total;
      }
    }

    return total;
  }
}
