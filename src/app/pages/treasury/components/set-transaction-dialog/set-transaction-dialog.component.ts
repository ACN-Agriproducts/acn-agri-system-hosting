import { TitleCasePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Account } from '@shared/classes/account';
import { Contact } from '@shared/classes/contact';
import { TRANSACTION_TYPES, Transaction } from '@shared/classes/transaction';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-set-transaction-dialog',
  templateUrl: './set-transaction-dialog.component.html',
  styleUrls: ['./set-transaction-dialog.component.scss'],
})
export class SetTransactionDialogComponent implements OnInit {
  public filteredContactOptions: Observable<Contact[]>;
  public transactionForm: FormGroup;
  public filteredTypeOptions: Observable<string[]>;

  public TRANSACTION_TYPES = TRANSACTION_TYPES;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    @Inject(MAT_DIALOG_DATA) public data: {
      contacts: Contact[], 
      accounts: Account[], 
      transaction?: Transaction, 
      currentAccount?: Account, 
      currentClient?: Contact
    },
    // @Inject(MAT_DIALOG_DATA) public data: any,
    private formbuilder: FormBuilder,
    private dialogRef: MatDialogRef<SetTransactionDialogComponent>,
    public titleCasePipe: TitleCasePipe
  ) { }

  ngOnInit() {
    this.transactionForm = this.formbuilder.group({
      amount: [this.data.transaction.amount ? Math.abs(this.data.transaction.amount) : null, Validators.required],
      date: [this.data.transaction.date],
      account: [this.data.currentAccount, Validators.required],
      client: [this.data.currentClient],
      clientAccountNumber: [this.data.transaction.clientAccountNumber],
      type: [this.data.transaction.type, Validators.required],
      description: [this.data.transaction.description],
      otherParty: [!!this.data.transaction.clientRef || !!this.data.transaction.clientAccountNumber],
      creditOrDebit: [this.data.transaction.amount ? (this.data.transaction.amount < 0 ? -1 : 1) : null, Validators.required],
      notes: [this.data.transaction.notes]
    });

    this.filteredContactOptions = this.transactionForm.controls.client.valueChanges.pipe(
      startWith(this.transactionForm.value.client?.name || ''),
      map(value => {
        const name = typeof value === "string" ? value : (value?.name ?? "");
        return this.data.contacts.filter(contact => contact.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()));
      })
    );

    this.filteredTypeOptions = this.transactionForm.controls.type.valueChanges.pipe(
      startWith(this.transactionForm.value.type || ''),
      map(value => this.TRANSACTION_TYPES.filter(type => type.toLocaleLowerCase().includes(value.toLocaleLowerCase())))
    );
  }
  
  logForm() {
    console.log(this.transactionForm.value)
  }

  public onSubmit() {
    const formData = this.transactionForm.value;
    const data = {
      amount: formData.amount * formData.creditOrDebit,
      date: formData.date,
      accountRef: formData.account.ref,
      accountName: formData.account.name,
      clientRef: formData.client?.ref ?? null,
      clientName: formData.client?.name ?? "",
      clientAccountNumber: formData.clientAccountNumber,
      type: formData.type,
      description: formData.description,
      notes: formData.notes
    };
    data.description ||= Transaction.setDescription(data as Transaction);

    this.dialogRef.close(data);
  }

  public clientDisplayFn(selectedOption: Contact | Account): string {
    return selectedOption?.name || "";
  }

  public selectType(selectedOption: string) {
    const value = selectedOption.toLocaleLowerCase();

    if (value === "deposit" || value === "withdrawal") {
      this.transactionForm.controls.otherParty.setValue(false);
      this.transactionForm.controls.creditOrDebit.setValue(value === "deposit" ? 1 : -1);
      this.resetClient();
    }
    else if (value === "payment from" || value === "payment to") {
      this.transactionForm.controls.otherParty.setValue(true);
      this.transactionForm.controls.creditOrDebit.setValue(value === "payment from" ? 1 : -1);
    }
  }

  public typeDisplayFn(value: string) {
    return this.titleCasePipe.transform(value);
  }

  public resetTextInput(key: string) {
    this.transactionForm.controls[key].reset("");
  }

  public resetClient() {
    this.transactionForm.controls.client.reset();
    this.transactionForm.controls.clientAccountNumber.reset("");
  }

  public handleOtherPartyChange(value: boolean) {
    if (!value) this.resetClient();
  }

  public accountCompareFn(acct1: Account, acct2: Account): boolean {
    return acct1 && acct2 ? acct1.name === acct2.name : acct1 === acct2;
  }

}
