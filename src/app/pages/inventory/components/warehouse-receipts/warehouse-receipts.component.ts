import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-warehouse-receipts',
  templateUrl: './warehouse-receipts.component.html',
  styleUrls: ['./warehouse-receipts.component.scss'],
})
export class WarehouseReceiptsComponent implements OnInit {
  warehouseReceiptList: {
    id: string,
    startDate: Date,
    status: string,
    grain: string
  }[] = [
    {id: "1234", startDate: new Date(), status: "active", grain:"Yellow Corn"}, 
    {id: "1234", startDate: new Date(), status: "active", grain:"Yellow Corn"}, 
    {id: "1234", startDate: new Date(), status: "active", grain:"Yellow Corn"}
  ]

  constructor() { }

  ngOnInit() {}

}
