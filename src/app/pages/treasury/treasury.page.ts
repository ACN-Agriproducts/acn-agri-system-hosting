import { OptionsComponent } from './components/options/options.component';
import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Account } from '@shared/classes/account';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Firestore, doc } from '@angular/fire/firestore';


@Component({
  selector: 'app-treasury',
  templateUrl: './treasury.page.html',
  styleUrls: ['./treasury.page.scss'],
})
export class TreasuryPage implements OnInit {
  public press: any;
  public accounts: Promise<Account[]>;
  public chartData: any;
  
  constructor(
    private popoverController: PopoverController,
    private session: SessionInfo,
    private db: Firestore
  ) { }

  ngOnInit() {
    this.accounts = Account.getAccounts(this.db, this.session.getCompany());
    console.log(this.accounts)

    const newDate = new Date();
    console.log(newDate.toDateString())

    this.chartData = [
      {
        name: "Transaction History",
        series: [
          {
            value: 500,
            name: newDate.toDateString()
          },
          {
            value: 1000,
            name: (new Date(2024, 1, 13)).toDateString()
          },
          {
            value: 400,
            name: (new Date(2024, 1, 14)).toDateString()
          },
          {
            value: 700,
            name: (new Date(2024, 1, 15)).toDateString()
          }
        ]
      }
    ];
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
    newAccount.name = "New Account"
    newAccount.accountNumber = "00000000000";
    newAccount.routingNumbers = ["00000", "11111", "22222", "33333"];
    await newAccount.set();
    console.log(newAccount)
  }

}
