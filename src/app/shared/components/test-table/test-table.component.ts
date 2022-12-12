import { Component, Input, OnInit } from '@angular/core';
import { CollectionReference } from 'firebase/firestore';

@Component({
  selector: 'app-test-table',
  templateUrl: './test-table.component.html',
  styleUrls: ['./test-table.component.scss'],
})
export class TestTableComponent implements OnInit {
  @Input() collRef: CollectionReference;
  @Input() infiniteScroll?: boolean;
  @Input() snapshot?: boolean;
  @Input() columns?: string[];

  public ready: boolean = false;

  testData = [
    { id: 1, customer: "TONY DANIEL", date: new Date(), status: "active", product: "Yellow Corn", price: 20.34 },
    { id: 2, customer: "COASTAL BEND GRAIN", date: new Date(), status: "closed", product: "Yellow Corn", price: 20.34 },
    { id: 3, customer: "AGUSTIN RODRIGUEZ", date: new Date(), status: "closed", product: "Yellow Corn", price: 20.34 },
  ]

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.ready = true;
    }, 2000);
  }

  public queryFn() {
    console.log("change query")
  }

  public action() {
    console.log("open contract")
  }
}
