import { Component, Inject, OnInit } from '@angular/core';
import { Firestore, doc } from '@angular/fire/firestore';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
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
  public startingBalance: number;
  public routingNumbers: { description: string, number: string }[] = [];

  public routingNumberInput: { description: string, number: string };
  public editingRoutingNumber: boolean = false;
  public selectedRoutingNumber: number;
  public editingAccount: boolean = false;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    @Inject(MAT_DIALOG_DATA) public data?: any
  ) { }

  ngOnInit() {
    this.resetRoutingNumberInput();

    console.log(this.data)

    if (!this.data) {
      this.data = new Account(doc(Account.getCollectionReference(this.db, this.session.getCompany())));
      return;
    }

    this.editingAccount = true;

    this.name = this.data.name;
    this.accountNumber = this.data.accountNumber;
    this.startingBalance = this.data.startingBalance;
    this.routingNumbers = this.data.routingNumbers.map(route => ({ ...route }));
   }

  ngOnDestroy() {
    delete this.data;
  }

  addRoutingNumber() {
    if (!this.routingNumberInput.number || !this.routingNumberInput.description) return;
    
    this.routingNumbers.push({ ...this.routingNumberInput });
    this.resetRoutingNumberInput();
  }

  deleteRoutingNumber(index: number) {
    this.routingNumbers.splice(index, 1);
  }

  test() {
    console.log(this.name, this.accountNumber, this.startingBalance, this.routingNumbers)
  }

  editRoutingNumber(index: number) {
    this.editingRoutingNumber = !this.editingRoutingNumber;
    this.selectedRoutingNumber = index;
    this.routingNumberInput = { ...this.routingNumbers[index] };
  }

  finishEditingRoutingNumber() {
    this.routingNumbers[this.selectedRoutingNumber] = { ...this.routingNumberInput };
    this.resetRoutingNumberInput();
    this.editingRoutingNumber = false;
  }

  resetRoutingNumberInput() {
    this.routingNumberInput = { description: "", number: "" };
  }

  confirm() {
    this.data.name = this.name;
    this.data.accountNumber = this.accountNumber;
    this.data.startingBalance = this.startingBalance;
    this.data.routingNumbers = this.routingNumbers;
  }

}
