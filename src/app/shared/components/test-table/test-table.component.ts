import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-table',
  templateUrl: './test-table.component.html',
  styleUrls: ['./test-table.component.scss'],
})
export class TestTableComponent implements OnInit {

  testData = [
    { id: 1, customer: "TONY DANIEL", date: new Date(), status: "active", product: "Yellow Corn", price: 20.34 },
    { id: 2, customer: "COASTAL BEND GRAIN", date: new Date(), status: "closed", product: "Yellow Corn", price: 20.34 },
    { id: 3, customer: "AGUSTIN RODRIGUEZ", date: new Date(), status: "closed", product: "Yellow Corn", price: 20.34 },
  ]

  constructor() { }

  ngOnInit() {}

}
