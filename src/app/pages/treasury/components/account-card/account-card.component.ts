import { formatDate } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Account } from '@shared/classes/account';

@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss'],
})
export class AccountCardComponent implements OnInit {
  @Input() account: Account;

  public chartData: any = [];
  public xAxisTicks: any = [];
  public colorScheme: any = {
    domain: ["#4D8C4A", "#FFBC04"]
  };

  constructor() {}

  ngOnInit() {
    console.log(this.account)
    const transactionHistory = { name: "Transaction History", series: [] };
    transactionHistory.series = Object.entries(this.account.transactionHistory).map(([date, amount]) => ({ name: date, value: amount }));
    transactionHistory.series.sort((a, b) => this.parseDateString(a.name).getTime() - this.parseDateString(b.name).getTime())
    this.chartData.push(transactionHistory);
  }

  public parseDateString(date: string): Date {
    return new Date(date);
  }

}


