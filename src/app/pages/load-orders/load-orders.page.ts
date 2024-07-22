import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-load-orders',
  templateUrl: './load-orders.page.html',
  styleUrls: ['./load-orders.page.scss'],
})
export class LoadOrdersPage implements OnInit {
  tableData;

  constructor() { }

  ngOnInit() {
    this.tableData = new Array(25);
  }

}
