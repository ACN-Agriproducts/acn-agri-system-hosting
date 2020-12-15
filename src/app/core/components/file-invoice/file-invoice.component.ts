import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-file-invoice',
  templateUrl: './file-invoice.component.html',
  styleUrls: ['./file-invoice.component.scss', './file-invoice.component.boostrap.scss']
})
export class FileInvoiceComponent implements OnInit {
@ViewChild('file') content: ElementRef;
@Output() fileInvoice = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.fileInvoice.emit(this.content);
    }, 300);
  }

}
