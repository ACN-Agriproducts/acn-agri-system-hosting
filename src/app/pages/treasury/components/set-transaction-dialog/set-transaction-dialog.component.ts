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
  public selectedContact: Contact;

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
      accountRef: [this.data.transaction.accountRef, Validators.required],
      clientRef: [this.data.transaction.clientRef, Validators.required]
    });

    this.filteredContactOptions = this.transactionForm.controls.clientRef.valueChanges.pipe(
      startWith(''),
      map(async value => {
        // const name = typeof value === "string" ? value : value?.name;
        const name = typeof value === "string" ? value : (await this.documentRefPipe.transform(value as DocumentReference<Contact>))?.name;
        return this.data.contacts.filter(contact => contact.name.toLowerCase().includes(name.toLowerCase()))
      })
    );
  }
  
  test() {
    console.log("Test")
    console.log(this.transactionForm)
    console.log(this.data)
  }

  onSubmit() {
    // this.dialogRef.close(this.data)
  }

  displayFn(selectedOption: Contact | Account): string {
    // return selectedOption?.name || "";
    console.log(this.selectedContact)
    return this.selectedContact?.name;
  }

  async contactSelected(selectedContactRef: DocumentReference<Contact>) {
    console.log(selectedContactRef)
    this.selectedContact = await this.documentRefPipe.transform(selectedContactRef);
    console.log(this.selectedContact)
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
