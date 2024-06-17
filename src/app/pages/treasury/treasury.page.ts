import { OptionsComponent } from './components/options/options.component';
import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Account } from '@shared/classes/account';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Firestore, Unsubscribe, doc, setDoc } from '@angular/fire/firestore';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { lastValueFrom } from 'rxjs';
import { SetAccountDialogComponent } from './components/set-account-dialog/set-account-dialog.component';
import { SetTransactionDialogComponent } from './components/set-transaction-dialog/set-transaction-dialog.component';
import { Contact } from '@shared/classes/contact';
import { Transaction } from '@shared/classes/transaction';


@Component({
  selector: 'app-treasury',
  templateUrl: './treasury.page.html',
  styleUrls: ['./treasury.page.scss'],
})
export class TreasuryPage implements OnInit {
  public press: any;
  public accounts: Account[];
  public chartData: any;
  public date: Date = new Date();
  public contacts: Promise<Contact[]>;
  public unsubs: Unsubscribe[] = [];
  public transactions: Transaction[];
    
  constructor(
    private popoverController: PopoverController,
    private session: SessionInfo,
    private db: Firestore,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    const accountUnsub = Account.getAccountsSnapshot(this.db, this.session.getCompany(), accounts => {
      this.accounts = accounts.docs.map(doc => doc.data());
    });

    this.date.setHours(0, 0, 0, 0);

    this.contacts = Contact.getList(this.db, this.session.getCompany());
    this.unsubs.push(accountUnsub);

    const transactionUnsub = Transaction.getTransactionsSnapshot(this.db, this.session.getCompany(), transactions => {
      this.transactions = transactions.docs.map(doc => doc.data());
    });
    this.unsubs.push(transactionUnsub);
  }

  ngOnDestroy() {
    this.unsubs.forEach(unsub => unsub());
  }

  public down = (event) => {
    this.press = setTimeout(() => {
      console.log('PRECIONO');
    }, 500);
  }
  public up = (event) => {
    console.log(event);

    clearTimeout(this.press)
  }
  public openOptions = async (event) => {
    const popover = await this.popoverController.create({
      component: OptionsComponent,
      event
    });
  }

  public async createAccount() {
    const dialogRef = this.dialog.open(SetAccountDialogComponent, {
      maxWidth: "none !important"
    });

    const account: Account = await lastValueFrom(dialogRef.afterClosed());
    if (!account) return;

    account.initializeTransactionHistory();
    await account.set();
  }

  public async createTransaction() {
    const transaction = new Transaction(doc(Transaction.getCollectionReference(this.db, this.session.getCompany())));

    const dialogRef = this.dialog.open(SetTransactionDialogComponent, {
      data: {
        accounts: [...this.accounts],
        contacts: [...(await this.contacts)],
        transaction
      },
      maxWidth: "none !important",
      autoFocus: false,
      maxHeight: "100vh"
    });

    const data = await lastValueFrom(dialogRef.afterClosed());
    if (!data) return;

    await setDoc(transaction.ref, { ...data, status: "pending" });
  }

  public logTransactions() {
    console.log(this.transactions)
  }

}
