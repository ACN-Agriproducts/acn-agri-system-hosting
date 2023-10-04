import { Component, OnInit } from '@angular/core';
import { Firestore, query, where } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-ticket-console',
  templateUrl: './ticket-console.page.html',
  styleUrls: ['./ticket-console.page.scss'],
})
export class TicketConsolePage implements OnInit {
  tickets: Ticket[];
  openContracts: Contract[] = [];
  transportList: Promise<Contact[]>;
  ticketIndex: number = 0;

  constructor(
    private session: SessionInfo,
    private db: Firestore,
  ) { }

  ngOnInit() {
    Contract.onSnapshot(
      query(Contract.getCollectionReference(this.db, this.session.getCompany()),
        where('status', '==', 'active'), where('plants', 'array-contains', this.session.getPlant())),
      this.openContracts,
      snap => console.log("Contracts", snap.docs.length)
    );

    this.transportList = Contact.getList(this.db, this.session.getCompany(), where('tags', 'array-contains', 'trucker'));
    this.transportList.then(next => console.log("transportList", next.length));
  }

}
