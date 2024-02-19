import { OptionsComponent } from './components/options/options.component';
import { ModalController, PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Account } from '@shared/classes/account';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Firestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { SetAccountDialogComponent } from './components/set-account-dialog/set-account-dialog.component';
import { SetAccountModalComponent } from './components/set-account-modal/set-account-modal.component';


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
  
  public createAccount: Function;
  
  constructor(
    private popoverController: PopoverController,
    private session: SessionInfo,
    private db: Firestore,
    private dialog: MatDialog,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    Account.getAccountsSnapshot(this.db, this.session.getCompany(), accounts => {
      this.accounts = accounts.docs.map(doc => doc.data());
    });

    this.date.setHours(0, 0, 0, 0);

    this.createAccount = this.matCreateAccount;
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

  public async matCreateAccount() {
    const dialogRef = this.dialog.open(SetAccountDialogComponent);

    const account: Account = await lastValueFrom(dialogRef.afterClosed());
    if (!account) return;

    account.initializeTransactionHistory();
    await account.set();
  }

  public async ionCreateAccount() {
    const modal = await this.modalCtrl.create({
      component: SetAccountModalComponent
    });
    modal.present();

    const { data } = await modal.onWillDismiss();
    if (!data) return;

    data.initializeTransactionHistory();
    await data.set();
  }

}
