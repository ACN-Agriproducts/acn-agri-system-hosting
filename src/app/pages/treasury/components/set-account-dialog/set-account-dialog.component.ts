import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Firestore, Timestamp, doc } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Account } from '@shared/classes/account';

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-set-account-dialog',
  templateUrl: './set-account-dialog.component.html',
  styleUrls: ['./set-account-dialog.component.scss'],
})
export class SetAccountDialogComponent implements OnInit {
  public account: Account;
  public routingNumber: string;
  public routingDescription: string;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    @Inject(MAT_DIALOG_DATA) private data?: any
  ) { }

  ngOnInit() {
    this.account = this.data ? this.data : new Account(doc(Account.getCollectionReference(this.db, this.session.getCompany())));
  }

  ngOnDestroy() {
    delete this.account;
  }

  addRoutingNumber() {
    if (!this.routingNumber || !this.routingDescription) return;

    this.account.routingNumbers[this.routingDescription] = this.routingNumber;
    this.routingDescription = "";
    this.routingNumber = "";
  }

  deleteRoutingNumbers(keyToDelete: string) {
    delete this.account.routingNumbers[keyToDelete];
  }

  test() {
    console.log(this.account)
  }

}
