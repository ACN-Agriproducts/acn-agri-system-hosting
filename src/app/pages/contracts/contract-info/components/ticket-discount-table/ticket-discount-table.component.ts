import { Component, Input, OnInit } from '@angular/core';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-ticket-discount-table',
  templateUrl: './ticket-discount-table.component.html',
  styleUrls: ['./ticket-discount-table.component.scss'],
})
export class TicketDiscountTableComponent implements OnInit {
  @Input() ticketDiscountList: { data: Ticket, discounts: any, includeInReport: boolean }[];

  constructor() { }

  ngOnInit() {

  }
}
