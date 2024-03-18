import { Component, Inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DocumentReference, Firestore, doc, getDoc } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Account } from '@shared/classes/account';
import { Contact } from '@shared/classes/contact';
import { Transaction } from '@shared/classes/transaction';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-set-transaction-dialog',
  templateUrl: './set-transaction-dialog.component.html',
  styleUrls: ['./set-transaction-dialog.component.scss'],
})
export class SetTransactionDialogComponent implements OnInit {
  public filteredContactOptions: Observable<Promise<Contact[]>>;
  public transactionForm: FormGroup;  

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
    private documentRefPipe: DocumentReferencePipe
  ) { }

  ngOnInit() {
    if (!this.data.transaction) {
      this.data.transaction = new Transaction(doc(Transaction.getCollectionReference(this.db, this.session.getCompany())));
    }

    this.transactionForm = this.formbuilder.group({
      amount: [this.data.transaction.amount, Validators.required],
      date: [this.data.transaction.date],
      account: [this.data.transaction.accountRef, Validators.required],
      client: [this.data.transaction.clientRef, Validators.required]
    });

    this.filteredContactOptions = this.transactionForm.controls.client.valueChanges.pipe(
      startWith(''),
      map(async value => {
        const name = typeof value === "string" ? value : value?.name;
        // const name = typeof value === "string" ? value : (await this.documentRefPipe.transform(value as DocumentReference<Contact>))?.name;
        return this.data.contacts.filter(contact => contact.name.toLowerCase().includes(name.toLowerCase()));
      })
    );
  }
  
  test() {
    console.log(this.data)
    console.log(this.transactionForm)
  }

  public onSubmit() {
    this.data.transaction.amount = this.transactionForm.controls.amount.value;
    this.data.transaction.date = this.transactionForm.controls.date.value;
    this.data.transaction.accountRef = this.transactionForm.controls.account.value.ref;
    this.data.transaction.clientRef = this.transactionForm.controls.client.value.ref;
    this.data.transaction.accountName = this.transactionForm.controls.account.value.name;
    this.data.transaction.clientName = this.transactionForm.controls.client.value.name;

    this.dialogRef.close(this.data.transaction);
  }

  public displayFn(selectedOption: Contact | Account): string {
    return selectedOption?.name || "";
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
