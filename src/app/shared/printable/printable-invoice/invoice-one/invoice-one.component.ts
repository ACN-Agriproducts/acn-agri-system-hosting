import { Component, Input, OnInit } from '@angular/core';
import { contactInfo, Invoice, item } from '@shared/classes/invoice';

@Component({
  selector: 'app-invoice-one',
  templateUrl: './invoice-one.component.html',
  styleUrls: ['./invoice-one.component.scss', './file-invoice.component.boostrap.scss'],
})
export class InvoiceOneComponent implements OnInit {

  @Input() invoice: Invoice;
  @Input() seller: contactInfo;
  @Input() buyer: contactInfo;
  @Input() id: number | string;
  @Input() date: Date;
  @Input() items: item[];
  @Input() total: number;

  constructor() { }

  ngOnInit() {}

}