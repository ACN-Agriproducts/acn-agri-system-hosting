import { Component, Input, OnInit } from '@angular/core';
import { contactInfo, Invoice, item } from '@shared/classes/invoice';

@Component({
  selector: 'app-invoice-two',
  templateUrl: './invoice-two.component.html',
  styleUrls: ['./invoice-two.component.scss'],
})
export class InvoiceTwoComponent implements OnInit {

  @Input() invoice: Invoice;
  @Input() seller: contactInfo;
  @Input() buyer: contactInfo;
  @Input() id: number | string;
  @Input() date: Date;
  @Input() items: item[];
  @Input() total: number;

  constructor() { }

  ngOnInit() {
  }
}
