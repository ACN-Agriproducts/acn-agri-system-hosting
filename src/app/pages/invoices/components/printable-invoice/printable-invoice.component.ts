import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-printable-invoice',
  templateUrl: './printable-invoice.component.html',
  styleUrls: ['./printable-invoice.component.scss', './file-invoice.component.boostrap.scss'],
})
export class PrintableInvoiceComponent implements OnInit {

  @Input() seller: any;
  @Input() buyer: any;
  @Input() id: number;
  @Input() date: Date;
  @Input() items: any[];
  @Input() total: number;

  constructor() { }

  ngOnInit() {}

}
