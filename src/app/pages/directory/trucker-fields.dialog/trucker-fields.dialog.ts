import { Component, Inject, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contact } from '@shared/classes/contact';

@Component({
  selector: 'app-trucker-fields.dialog',
  templateUrl: './trucker-fields.dialog.html',
  styleUrls: ['./trucker-fields.dialog.scss'],
})
export class TruckerFieldsDialog implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public contact: Contact,
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.contact.destinations ??= [];
  }

}
