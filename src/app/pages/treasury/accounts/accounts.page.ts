import { Component, OnInit } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Account } from '@shared/classes/account';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage implements OnInit {
  public accounts: Promise<Account[]>;

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) {}

  ngOnInit() {
  }

  public async createAccount() {
    const newAccount = new Account(doc(Account.getCollectionReference(this.db, this.session.getCompany())));
    await newAccount.set();
    console.log(newAccount)
  }

}

// DELETE ACCOUNTS PAGE