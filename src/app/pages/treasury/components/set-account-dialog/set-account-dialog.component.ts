import { Component, Inject, OnInit } from '@angular/core';
import { Firestore, doc } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Account } from '@shared/classes/account';

@Component({
  selector: 'app-set-account-dialog',
  templateUrl: './set-account-dialog.component.html',
  styleUrls: ['./set-account-dialog.component.scss'],
})
export class SetAccountDialogComponent implements OnInit {
  public name: string;
  public accountNumber: string;
  public balance: number;
  public routingNumbers: { [description: string]: string } = {};

  public routingNumber: string;
  public routingDescription: string;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    @Inject(MAT_DIALOG_DATA) public data?: any
  ) { }

  ngOnInit() {
    if (!this.data) {
      this.data = new Account(doc(Account.getCollectionReference(this.db, this.session.getCompany())));
      return;
    }

    this.name = this.data.name;
    this.accountNumber = this.data.accountNumber;
    this.balance = this.data.balance;
    this.routingNumbers = this.data.routingNumbers;
   }

  ngOnDestroy() {
    delete this.data;
  }

  addRoutingNumber() {
    if (!this.routingNumber || !this.routingDescription) return;

    this.routingNumbers[this.routingDescription] = this.routingNumber;
    this.routingDescription = "";
    this.routingNumber = "";
  }

  deleteRoutingNumbers(keyToDelete: string) {
    delete this.routingNumbers[keyToDelete];
  }

  test() {
    console.log(this.name, this.accountNumber, this.balance, this.routingNumbers)
  }

  confirm() {
    this.data.name = this.name;
    this.data.accountNumber = this.accountNumber;
    this.data.balance = this.balance;
    this.data.routingNumbers = this.routingNumbers;
  }

}
