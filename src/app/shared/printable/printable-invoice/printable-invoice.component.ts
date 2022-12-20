import { Component, Input, OnInit } from '@angular/core';
import { contactInfo, item } from '@shared/classes/invoice';

@Component({
  selector: 'app-printable-invoice',
  templateUrl: './printable-invoice.component.html',
  styleUrls: ['./printable-invoice.component.scss', './file-invoice.component.boostrap.scss'],
})
export class PrintableInvoiceComponent implements OnInit {

  @Input() seller: contactInfo;
  @Input() buyer: contactInfo;
  @Input() id: number | string;
  @Input() date: Date;
  @Input() items: item[];
  @Input() total: number;

  constructor() { }

  ngOnInit() {}

}
