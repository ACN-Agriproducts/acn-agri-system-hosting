import { AfterContentInit, ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { contactInfo, Invoice, item } from '@shared/classes/invoice';

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
      weightTotal += newRows[index].quantity;
      newRows[index++] = {
        description: item.name,
        quantity: item.quantity,
        price: item.price,
        type: item.type
      };

      if(item.details) newRows[index++] = { description: item.details };

      if(item.type) newRows[index++] = {};
    });

    this.weightTotal = weightTotal;
    this.contentRows = newRows;
  }
}

interface Row {
  description?: string;
  quantity?: number;
  price?: number;
  type?: string;
}
