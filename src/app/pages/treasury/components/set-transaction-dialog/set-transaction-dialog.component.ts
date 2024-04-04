import { TitleCasePipe } from '@angular/common';
import { Component, Inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DocumentReference, Firestore, doc, getDoc } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
      transaction?: Transaction, 
      accounts: Account[], 
      contacts: Contact[] 
    },
    private formbuilder: FormBuilder,
    private dialogRef: MatDialogRef<SetTransactionDialogComponent>,
    public titleCasePipe: TitleCasePipe
  ) { }

  ngOnInit() {
    if (!this.data.transaction) {
      this.data.transaction = new Transaction(doc(Transaction.getCollectionReference(this.db, this.session.getCompany())));
    }

    this.transactionForm = this.formbuilder.group({
      amount: [this.data.transaction.amount, Validators.required],
      date: [this.data.transaction.date],
      account: [this.data.transaction.accountRef, Validators.required],
      client: [this.data.transaction.clientRef],
      clientAccountNumber: [this.data.transaction.clientAccountNumber],
      type: [this.data.transaction.type, Validators.required],
      description: [this.data.transaction.description],
      otherParty: [true],
      creditOrDebit: [, Validators.required],
      notes: [this.data.transaction.notes]
    });

    this.filteredContactOptions = this.transactionForm.controls.client.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === "string" ? value : (value?.name ?? "");
        return this.data.contacts.filter(contact => contact.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()));
      })
    );

    this.filteredTypeOptions = this.transactionForm.controls.type.valueChanges.pipe(
      startWith(''),
      map(value => this.TRANSACTION_TYPES.filter(type => type.toLocaleLowerCase().includes(value.toLocaleLowerCase())))
    );
  }
  
  test() {
    console.log(this.transactionForm.value)
  }

  public onSubmit() {
    this.setTransactionData(this.transactionForm.value);
    this.dialogRef.close(this.data.transaction);
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
    this.transactionForm.controls.clientAccountNumber.reset();
  }

  public handleOtherPartyChange(value: boolean) {
    if (!value) this.resetClient();
  }

  public setTransactionData(formData: any) {
    this.data.transaction.amount = formData.amount * formData.creditOrDebit;
    this.data.transaction.date = formData.date;
    this.data.transaction.accountRef = formData.account.ref;
    this.data.transaction.accountName = formData.account.name;
    this.data.transaction.clientRef = formData.client?.ref ?? null;
    this.data.transaction.clientName = formData.client?.name ?? "";
    this.data.transaction.clientAccountNumber = formData.clientAccountNumber;
    this.data.transaction.type = formData.type;
    
    this.data.transaction.setDescription(formData.description);
  }

}

@Pipe({
  name: 'documentRef'
})
export class DocumentReferencePipe implements PipeTransform {
  transform<Type>(ref: DocumentReference<Type>): Promise<Type> {
    return getDoc(ref).then(doc => doc.data());
  }
}

export interface SetTransactionData {
  amount: number;
  date: Date;
  account: Account;
  client: Contact;
  clientAccountNumber: string;
}
