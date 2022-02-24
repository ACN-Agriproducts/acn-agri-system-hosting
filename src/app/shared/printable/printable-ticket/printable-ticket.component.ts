import { Component, OnInit, Input } from '@angular/core';
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
  public valuesList: any[] = [{label: 'test', value: 'test' }];

  constructor() {}

  ngOnInit(): void {
    this.valuesList = [
      {label: 'Moisture', value: this.ticket.moisture},
      {label: 'Contract #', value: this.contract.id},
      {label: 'TestWeight', value: this.ticket.weight},
      {label: 'Product', value: this.ticket.productName},
      {label: 'PPB', value: this.ticket.PPB},
      {label: 'Lot', value: null},
      {label: 'Foreign Mat.', value: null},
      {label: 'Load #', value: 5},
      {label: 'U.S. Grade', value: this.ticket.grade},
      {label: 'Origin', value: this.ticket.origin},
      {label: 'DryWeight', value: this.ticket.dryWeight},
      {label: 'Orig. Ticket #', value: this.ticket.original_ticket},
      {label: 'Discount/100lbs', value: (this.ticket.dryWeight / this.ticket.getNet() * 1000) % 1 / 10},
      {label: 'Orig Weight', value: this.ticket.original_weight},
      {label: 'DryWeight', value: 54780},
      {label: 'Tank', value: 'Tank 5'},
    ];
  }

}
