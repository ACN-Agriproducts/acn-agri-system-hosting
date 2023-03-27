import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChildren } from '@angular/core';
import { contactInfo, Invoice, item } from '@shared/classes/invoice';
import { Mass } from '@shared/classes/mass';
import { TypeTemplateDirective } from '@core/directive/type-template/type-template.directive';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

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
  @Input() isExportInvoice: boolean;
  @Input() exportInfo: {
    product: string;
    quantity: Mass;
  };

  @Input("documentName") set documentName(newName: string) {
    this.version$.next(newName);
  }

  public invoiceData: any;
  public docName: string;
  public template: any;

  @ViewChildren(TypeTemplateDirective) private versionTemplates: QueryList<TypeTemplateDirective>;
  public version$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public template$: Observable<TemplateRef<any>> = this.version$.pipe(
    filter(() => !!this.versionTemplates),
    map(version => this.versionTemplates.find(template => template.typeTemplate == (version ?? this.invoice?.printableDocumentName))?.templateRef)
  );

  constructor() { }

  ngOnInit() {
    this.setData();
    this.version$.next(this.version$.getValue());
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setData();
  }

  ngAfterViewInit(): void {
    this.invoiceDocsList.emit(
      ["Document one", "Document two"]
    );
    this.version$.next(this.version$.getValue());
  }

  setData() {
    const data: any = {};
    
    if(this.invoice) {
      data.seller = this.invoice.seller;
      data.buyer = this.invoice.buyer;
      data.id = this.invoice.id;
      data.date = this.invoice.date;
      data.items = this.invoice.items;
      data.total = this.invoice.total;
      data.exportInfo = this.invoice.exportInfo;
      data.isExportInvoice = this.invoice.isExportInvoice
      this.docName = this.invoice.printableDocumentName;
    }
    else {
      data.seller = this.seller;
      data.buyer = this.buyer;
      data.id = this.id;
      data.date = this.date;
      data.items = this.items;
      data.total = this.total;
      data.exportInfo = this.exportInfo;
      data.isExportInvoice = this.isExportInvoice
      this.docName = this.documentName;
    }

    this.invoiceData = data;
  }
}
