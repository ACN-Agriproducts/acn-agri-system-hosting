import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-warehouse-receipt-group-card',
  templateUrl: './warehouse-receipt-group-card.component.html',
  styleUrls: ['../../warehouse-receipts.page.scss'],
})
export class WarehouseReceiptGroupCardComponent implements OnInit {

  public list: number[] = [1, 2, 3, 4, 5];

  constructor() { }

  ngOnInit() {

  }



  public openExpandable = (event: Event): void => {
    const target = event.target as HTMLElement;
    const card = target.parentElement.parentElement;
    const expandable = card.querySelector('.expandable-wr-list') as HTMLElement;

    if (expandable.style.maxHeight){
      expandable.style.maxHeight = null;
    } else {
      expandable.style.maxHeight = expandable.scrollHeight + "px";
    }
  }

}
