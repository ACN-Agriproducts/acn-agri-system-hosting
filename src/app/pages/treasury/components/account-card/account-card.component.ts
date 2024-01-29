import { formatDate } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
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

  constructor() {}

  ngOnInit() {
    console.log(this.account)

    const transactionHistory = { name: "Transaction History", series: [] };
    transactionHistory.series = Object.entries(this.account.transactionHistory).map(([date, amount]) => {
      const parseDate = this.parseDateString(date);
      this.xAxisTicks.push(parseDate);
      return {
        name: parseDate,
        value: amount
      }
    });

    this.chartData.push(transactionHistory);
  }
  
  public parseDateString(date: string): Date {
    const [secondsString, nanosecondsString] = date.replace("Timestamp(", "").replace(")", "").replace(" ", "").split(',');
    const [secondsNum, nanosecondsNum] = [+secondsString.replace("seconds=", ""), +nanosecondsString.replace("nanoseconds=", "")];

    return (new Timestamp(secondsNum, nanosecondsNum)).toDate();
  }

  public formatDateTick(value) {
    return formatDate(value, "mediumDate", "en-US");
  }
}


