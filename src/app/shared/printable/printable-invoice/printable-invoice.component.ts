import { AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { contactInfo, Invoice, item } from '@shared/classes/invoice';

@Component({
  selector: 'app-printable-invoice',
  templateUrl: './printable-invoice.component.html',
  styleUrls: ['./printable-invoice.component.scss'],
})
export class PrintableInvoiceComponent implements OnInit, AfterViewInit, OnChanges {

  @Output() invoiceDocsList = new EventEmitter<string[]>();

  @Input() invoice: Invoice;
  @Input() seller: contactInfo;
  @Input() buyer: contactInfo;
  @Input() id: number | string;
  @Input() date: Date;
  @Input() items: item[];
  @Input() total: number;

  @Input() documentName: string;

  public invoiceData: any;
  public docName: string;

  @ViewChild("invoiceOne") invoiceOne: TemplateRef<any>;
  @ViewChild("invoiceTwo") invoiceTwo: TemplateRef<any>;

  public templateMap: Map<string, TemplateRef<any>> = new Map();

  constructor() { }

  ngOnInit() {
    this.setData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setData();
  }

  ngAfterViewInit(): void {
    this.templateMap = new Map<string, TemplateRef<any>>([
      ["Document one", this.invoiceOne],
      ["Document two", this.invoiceTwo]
    ]);

    // console.log(this.invoiceOne)

    this.invoiceDocsList.emit(
      [...this.templateMap.keys()]
    );

    // console.log(this.docName, this.templateMap, this.templateMap.get(this.docName));
  }

  ngAfterViewChecked() {

  }

  setData() {
    // console.log("SetData trigger")
    const data: any = {};
    
    if(this.invoice) {
      data.seller = this.invoice.seller;
      data.buyer = this.invoice.buyer;
      data.id = this.invoice.id;
      data.date = this.invoice.date;
      data.items = this.invoice.items;
      data.total = this.invoice.total;
      this.docName = this.invoice.printableDocumentName;
    }
    else {
      data.seller = this.seller;
      data.buyer = this.buyer;
      data.id = this.id;
      data.date = this.date;
      data.items = this.items;
      data.total = this.total;
      this.docName = this.documentName;
    }

    this.invoiceData = data;
  }
}
