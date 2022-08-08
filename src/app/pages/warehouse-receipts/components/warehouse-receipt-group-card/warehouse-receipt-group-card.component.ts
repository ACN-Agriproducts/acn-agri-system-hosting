import { Component, Input, OnInit } from '@angular/core';
import { WarehouseReceipt, WarehouseReceiptGroup } from '@shared/classes/WarehouseReceiptGroup';

@Component({
  selector: 'app-warehouse-receipt-group-card',
  templateUrl: './warehouse-receipt-group-card.component.html',
  styleUrls: ['../../warehouse-receipts.page.scss'],
})
export class WarehouseReceiptGroupCardComponent implements OnInit {
  @Input() wrGroup: WarehouseReceiptGroup;

  public wrList: WarehouseReceipt[];
  public wrIdList: number[];
  public idRange: string;
  public product: string;

  public 

  constructor() { }

  ngOnInit() {
    this.wrList = this.wrGroup.warehouseReceiptList;
    this.wrIdList = this.wrGroup.warehouseReceiptIdList;

    this.product = this.wrList[0].product;
    this.idRange = this.getIdRange();
  }


  public getIdRange = (): string => {
    let result: string[] = [];
    let idGroup = "";
    this.wrIdList.forEach((id, index) => {
      if (index === this.wrIdList.length - 1) {
        return;
      }
      
      if (this.wrIdList[index + 1] - id > 1) {
        idGroup = "";
        result.push(`${id} `);
        return;
      }
      result.push(`${id}`);
    })

    return result.join();
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
