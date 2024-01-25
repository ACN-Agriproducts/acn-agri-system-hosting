import { OptionsComponent } from './components/options/options.component';
import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Account } from '@shared/classes/account';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Firestore, Timestamp, doc } from '@angular/fire/firestore';


@Component({
  selector: 'app-treasury',
  templateUrl: './treasury.page.html',
  styleUrls: ['./treasury.page.scss'],
})
export class TreasuryPage implements OnInit {
  public press: any;
  public accounts: Promise<Account[]>;
  public chartData: any;
  public date: Date = new Date();

  public ionicTemplate: boolean = false;
  
  constructor(
    private popoverController: PopoverController,
    private session: SessionInfo,
    private db: Firestore
  ) { }

  ngOnInit() {
    this.accounts = Account.getAccounts(this.db, this.session.getCompany());
    console.log(this.accounts)

    this.date.setDate(1);
    this.date.setHours(0, 0, 0, 0);
    console.log(this.date.toJSON())

    this.chartData = [
      {
        name: "Transaction History",
        series: []
      }
    ];

    for (let i = 0; i < 30; i++) {
      this.chartData[0].series.push({
        value: Math.floor(Math.random() * 1000),
        name: new Date(this.date.valueOf() + 86400000 * i)
      });
    }
  }

  public down = (event) => {
    this.press = setTimeout(() => {
      console.log('PRECIONO');
    }, 500);
  }
  public up = (event) => {
    console.log(event);

    clearTimeout(this.press)
  }
  public openOptions = async (event) => {
    const popover = await this.popoverController.create({
      component: OptionsComponent,
      event
    });
  }

  public async createAccount() {
    const newAccount = new Account(doc(Account.getCollectionReference(this.db, this.session.getCompany())));

    newAccount.name = "Avery Accounts"
    newAccount.accountNumber = "00000000000";
    newAccount.routingNumbers = ["000000000", "111111111", "222222222", "333333333"];

    const timestamp = Timestamp.fromDate(this.date);
    newAccount.transactionHistory = {
      [timestamp.toString()]: Math.floor(Math.random() * 1000)
    };

    await newAccount.set();
    console.log(newAccount)
  }

}

// WORK ON CREATING ACCOUNTS -- USE A NEW DIALOG PROBABLY -- KEEP WORKING ON LAYOUT/DESIGN OF ACCOUNT CARDS.
// MAYBE MAKE IT SO THAT ONLY THE CHART SHOWS AND WHEN YOU CLICK ON THE ACCOUNT CARD YOU CAN SEE THE REST OF
// IT'S INFORMATION, LIKE THE ACCOUNT AND ROUTING NUMBERS AS WELL AS THE BALANCE
// TECHNICALLY YOU SHOULD ALREADY BE ABLE TO SEE THE BALANCE ON THE TRANSACTION HISTORY CHART
