import { Component, Input, OnInit } from '@angular/core';
import { contactInfo, Invoice, item } from '@shared/classes/invoice';

@Component({
  selector: 'app-printable-invoice',
  templateUrl: './printable-invoice.component.html',
  styleUrls: ['./printable-invoice.component.scss'],
})
export class PrintableInvoiceComponent implements OnInit {

  @Input() invoice: Invoice;
  @Input() seller: contactInfo;
  @Input() buyer: contactInfo;
  @Input() id: number | string;
  @Input() date: Date;
  @Input() items: item[];
  @Input() total: number;

  public invoiceData: any;

  constructor() { }

  ngOnInit() {
    const data: any = {};

    if(this.invoice) {
      data.invoice = this.invoice
    }
    else {
      data.seller = this.seller;
      data.buyer = this.buyer;
      data.id = this.id;
      data.date = this.date;
      data.items = this.items;
      data.total = this.total;
    }

    this.invoiceData = data;
  }
}
