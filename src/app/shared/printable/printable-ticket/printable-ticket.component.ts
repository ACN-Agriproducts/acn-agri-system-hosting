import { Component, Input } from '@angular/core';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';


@Component({
  selector: 'app-printable-ticket',
  templateUrl: './printable-ticket.component.html',
  styleUrls: ['./printable-ticket.component.scss']
})
export class PrintableTicketComponent {
  @Input() ticket: Ticket;
  @Input() contract: Contract;
  @Input() transport: Contact;
  @Input() client: Contact;

  constructor() {}
}
 