import { Component, Input, OnInit } from '@angular/core';
import { Firestore, doc } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { ModalController } from '@ionic/angular';
import { Account } from '@shared/classes/account';

@Component({
  selector: 'app-set-account-modal',
  templateUrl: './set-account-modal.component.html',
  styleUrls: ['./set-account-modal.component.scss'],
})
export class SetAccountModalComponent implements OnInit {
  @Input() account: Account;

  public routingNumber: string;
  public routingDescription: string;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    public modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.account ??= new Account(doc(Account.getCollectionReference(this.db, this.session.getCompany())));
  }

  addRoutingNumber() {
    if (!this.routingNumber || !this.routingDescription) return;

    this.account.routingNumbers[this.routingDescription] = this.routingNumber;
    this.routingDescription = "";
    this.routingNumber = "";
  }

  deleteRoutingNumbers(keyToDelete: string) {
    delete this.account.routingNumbers[keyToDelete];
  }

  test() {
    console.log(this.account)
  }

}
