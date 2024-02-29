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
  // public routingNumbers: { [description: string]: string } = {};
  public routingNumbers: { description: string, number: string }[] = [];

  public routingNumber: string;
  public routingDescription: string;
  // public routingNumber: { description: string, number: string } = { description: "", number: "" };
  public editingRoutingNumber: boolean = false;

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
    // if (!this.routingNumber.number || !this.routingNumber.description) return;

    // this.routingNumbers[this.routingDescription] = this.routingNumber;
    // this.routingNumbers.push(this.routingNumber);
    this.routingNumbers.push({ description: this.routingDescription, number: this.routingNumber });

    this.resetRoutingNumber();
  }

  // deleteRoutingNumber(keyToDelete: string) {
  //   delete this.routingNumbers[keyToDelete];
  // }
  deleteRoutingNumber(index: number) {
    this.routingNumbers.splice(index, 1);
  }

  test() {
    console.log(this.name, this.accountNumber, this.balance, this.routingNumbers)
  }

  editRoutingNumber(index: number) {
    this.editingRoutingNumber = !this.editingRoutingNumber;

    // this.routingNumber = this.routingNumbers[index];
    this.routingNumber = this.routingNumbers[index].number;
    this.routingDescription = this.routingNumbers[index].description;
  }

  finishEditingRoutingNumber(index: number) {
    this.routingNumbers[index].number = this.routingNumber;
    this.routingNumbers[index].description = this.routingDescription;
    
    this.resetRoutingNumber();
    this.editingRoutingNumber = false;
  }

  resetRoutingNumber() {
    this.routingNumber = "";
    this.routingDescription = "";
    // this.routingNumber = { description: "", number: "" };
  }

  confirm() {
    this.data.name = this.name;
    this.data.accountNumber = this.accountNumber;
    this.data.balance = this.balance;
    this.data.routingNumbers = this.routingNumbers;
  }

}
