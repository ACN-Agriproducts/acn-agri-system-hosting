import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Account } from '@shared/classes/account';
import { SetAccountDialogComponent } from '../set-account-dialog/set-account-dialog.component';
import { lastValueFrom } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { SetAccountModalComponent } from '../set-account-modal/set-account-modal.component';

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

  public editAccount: Function;

  constructor(
    private dialog: MatDialog,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    const transactionHistory = { name: "Transaction History", series: [] };
    transactionHistory.series = Object.entries(this.account.transactionHistory).map(([date, amount]) => ({ name: date, value: amount }));
    transactionHistory.series.sort((a, b) => this.parseDateString(a.name).getTime() - this.parseDateString(b.name).getTime())
    this.chartData.push(transactionHistory);

    this.editAccount = this.matEditAccount;
  }

  public parseDateString(date: string): Date {
    return new Date(date);
  }

  public async openAccountDetails() {

  }

  public async matEditAccount() {
    const dialogRef = this.dialog.open(SetAccountDialogComponent, {
      data: this.account,
      // height: "100vh",
      // width: "100vw",
      maxWidth: "none !important"
    });

    const account: Account = await lastValueFrom(dialogRef.afterClosed());
    if (!account) return;

    await account.set();
  }

  public async ionEditAccount() {
    const modal = await this.modalCtrl.create({
      component: SetAccountModalComponent,
      componentProps: {
        account: this.account
      }
    });
    modal.present();

    const { data } = await modal.onWillDismiss();
    if (!data) return;

    data.initializeTransactionHistory();
    await data.set();
  }

  public archiveAccount() {
    console.log("ARCHIVE ACCOUNT")
  }

}


