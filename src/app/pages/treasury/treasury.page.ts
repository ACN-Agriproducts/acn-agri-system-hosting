import { OptionsComponent } from './components/options/options.component';
import { ModalController, PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Account } from '@shared/classes/account';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Firestore } from '@angular/fire/firestore';
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
  public accounts: Account[];
  public chartData: any;
  public date: Date = new Date();
    
  constructor(
    private popoverController: PopoverController,
    private session: SessionInfo,
    private db: Firestore,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
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
    const dialogRef = this.dialog.open(SetAccountDialogComponent, {
      maxWidth: "none !important"
    });

    const account: Account = await lastValueFrom(dialogRef.afterClosed());
    if (!account) return;

    account.initializeTransactionHistory();
    await account.set();
  }

}
