import { Component, OnInit, Input } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { Invoice } from '@shared/classes/invoice';

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

  async ngOnInit() {
    this.invoiceData = new Array<any>(this.invoiceList.length);
    let counter = 0;

    if(this.invoiceData.length == 0) {
      this.ready = true;
    }

    const promises = [];
    this.invoiceList.forEach((invoice, index) => {
      const promise = invoice.withConverter(Invoice.converter).get().then(val => {
        // Add invoice data to list
        const data = val.data();
        let formatedData = {
          id: data.id,
          name: data.buyer.name,
          total: 0,
          status: data.status
        };
        for(const item of data.items) {
          if(!item.affectsInventory) {
            continue;
          }

          for(const info of item.inventoryInfo) {
            if(info.product == this.productName) {
              formatedData.total += info.quantity * item.quantity;
            }
          }
        }
        this.invoiceData[index] = formatedData;
      });

      promises.push(promise);
    });

    await Promise.all(promises);
    this.ready = true;
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
