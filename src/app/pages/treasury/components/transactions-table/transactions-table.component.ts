import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Transaction } from '@shared/classes/transaction';
import { SetTransactionDialogComponent } from '../set-transaction-dialog/set-transaction-dialog.component';
import { Contact } from '@shared/classes/contact';
import { Account } from '@shared/classes/account';
import { DocumentReference, getDoc, updateDoc } from '@angular/fire/firestore';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-transactions-table',
  templateUrl: './transactions-table.component.html',
  styleUrls: ['./transactions-table.component.scss'],
})
export class TransactionsTableComponent implements OnInit {
  @Input() transactions: Transaction[];
  @Input() accounts: Account[];
  @Input() contacts: Contact[];

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {}

  public async editTransaction(transaction: Transaction) {
    const currentAccount = await this.getDocByRef(transaction.accountRef);
    const currentClient = await this.getDocByRef(transaction.clientRef);

    const dialogRef = this.dialog.open(SetTransactionDialogComponent, {
      data: {
        accounts: [...this.accounts],
        contacts: [...this.contacts],
        transaction,
        currentAccount: { ...currentAccount, ref: transaction.accountRef },
        currentClient: { ...currentClient, ref: transaction.clientRef }
      },
      autoFocus: false,
      maxWidth: "none !important",
      maxHeight: "100vh"
    });

    const data = await lastValueFrom(dialogRef.afterClosed());
    if (!data) return;

    await updateDoc(transaction.ref, data);
  }

  public archiveTransaction(transaction: Transaction) {

  }

  public getDocByRef<Type>(ref: DocumentReference<Type>) {
    if (!ref) return;
    return getDoc(ref).then(doc => doc.data());
  }

}

@Pipe({
  name: 'absNum'
})
export class AbsoluteValuePipe implements PipeTransform {
  transform(value: number, ...args: any[]) {
    return Math.abs(value);
  }
}
