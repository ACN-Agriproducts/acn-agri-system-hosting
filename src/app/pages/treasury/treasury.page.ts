import { OptionsComponent } from './components/options/options.component';
import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Account } from '@shared/classes/account';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Firestore, Timestamp, doc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { SetAccountDialogComponent } from './components/set-account-dialog/set-account-dialog.component';


@Component({
  selector: 'app-treasury',
  templateUrl: './treasury.page.html',
  styleUrls: ['./treasury.page.scss'],
})
export class TreasuryPage implements OnInit {
  public press: any;
  // public accounts: Promise<Account[]>;
  public accounts: Account[];
  public chartData: any;
  public date: Date = new Date();

  public ionic: boolean = false;
  
  constructor(
    private popoverController: PopoverController,
    private session: SessionInfo,
    private db: Firestore,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    // this.accounts = Account.getAccounts(this.db, this.session.getCompany());
    Account.getAccountsSnapshot(this.db, this.session.getCompany(), accounts => {
      this.accounts = accounts.docs.map(doc => doc.data());
    });

    this.date.setHours(0, 0, 0, 0);
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
    const dialogRef = this.dialog.open(SetAccountDialogComponent);

    const account: Account = await lastValueFrom(dialogRef.afterClosed());
    if (!account) return;

    account.initializeTransactionHistory();

    await account.set();
  }

  public async editAccount() {

  }

  public async openAccount() {
    
  }

}

// WORK ON CREATING/DISPLAYING AN ACCOUNT -- USE A NEW DIALOG PROBABLY
// MAYBE MAKE IT SO THAT ONLY THE CHART SHOWS AND WHEN YOU CLICK ON THE ACCOUNT CARD YOU CAN SEE THE REST OF
// IT'S INFORMATION, LIKE THE ACCOUNT AND ROUTING NUMBERS AS WELL AS THE BALANCE
