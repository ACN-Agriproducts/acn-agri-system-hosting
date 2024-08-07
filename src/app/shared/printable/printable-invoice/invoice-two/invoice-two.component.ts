import { AfterContentInit, ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { contactInfo, Invoice, item } from '@shared/classes/invoice';
import { Mass } from '@shared/classes/mass';

@Component({
  selector: 'app-invoice-two',
  templateUrl: './invoice-two.component.html',
  styleUrls: ['./invoice-two.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceTwoComponent implements OnInit, OnChanges {

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
  @Input() incoterm: string;

  public contentRows: Row[];
  public readonly rowLength = 28;
  public weightTotal: number;

  constructor() { }

  ngOnInit() {
    this.setRows();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setRows()
  }

  setRows() {
    const newRows: Row[] = Array(this.rowLength).fill({});
    let weightTotal = 0;

    let index = 0;
    this.items.forEach((item) => {
      weightTotal += newRows[index]?.quantity ?? 0;
      newRows[index++] = {
        description: item.name,
        quantity: item.quantity,
        price: item.price,
        type: item.type,
        isDetailsRow: false,
      };

      if(item.details) newRows[index++] = { description: item.details, isDetailsRow: true };

      if(item.type) newRows[index++] = {};
    });

    this.weightTotal = weightTotal;
    this.contentRows = newRows;
  }

  getMTonsTotal(): number {
    let total = 0;
    this.items.forEach(item => {
      total += item.quantity ?? 0;
    });
    return total;
  }
}

interface Row {
  description?: string;
  quantity?: number;
  price?: number;
  type?: string;
  isDetailsRow?: boolean
}
