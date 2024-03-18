import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from '@shared/classes/transaction';

@Component({
  selector: 'app-transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.scss'],
})
export class TransactionsTableComponent implements OnInit {
  @Input() transactions: Transaction[];

  constructor() { }

  ngOnInit() {}

}
