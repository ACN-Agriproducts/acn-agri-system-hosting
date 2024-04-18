import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company } from '@shared/classes/company';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';


@Component({
  selector: 'app-printable-ticket',
  templateUrl: './printable-ticket.component.html',
  styleUrls: ['./printable-ticket.component.scss']
})
export class PrintableTicketComponent implements OnInit {
  @Input() ticket: Ticket;
  @Input() contract: Contract;
  @Input() transport: Contact;
  @Input() client: Contact;

  company: Promise<Company>;
  logoURL = '';

  constructor(
    private db: Firestore,
    private session: SessionInfo,
  ) {}

  ngOnInit() {
    this.company = this.session.getCompanyObject();
    this.company.then(async doc => this.logoURL = await doc.getLogoURL(this.db));
  }
}
 