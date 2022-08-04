import { Component, Input, OnInit } from '@angular/core';
import { WarehouseReceipt, WarehouseReceiptGroup } from '@shared/classes/WarehouseReceiptGroup';

@Component({
  selector: 'app-warehouse-receipt-group-card',
  templateUrl: './warehouse-receipt-group-card.component.html',
  styleUrls: ['../../warehouse-receipts.page.scss'],
})
export class WarehouseReceiptGroupCardComponent implements OnInit {
  @Input() warehouseReceiptGroup: WarehouseReceiptGroup;

  public list: number[] = [1, 2, 3, 4, 5];
  public warehouseReceiptList: WarehouseReceipt[];

  constructor() { }

  ngOnInit() {
    // populate html receipt list
    
  }


  public openExpandable = (event: Event): void => {
    const card = (event.target as HTMLElement).parentElement.parentElement;
    const expandable = card.querySelector('.expandable-wr-list') as HTMLElement;

    if (expandable.style.maxHeight){
      expandable.style.maxHeight = null;
    } else {
      expandable.style.maxHeight = expandable.scrollHeight + "px";
    }
  }

}
