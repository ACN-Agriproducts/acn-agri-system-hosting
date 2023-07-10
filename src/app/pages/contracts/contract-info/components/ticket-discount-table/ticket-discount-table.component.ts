import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TicketWithDiscounts } from '@shared/classes/ticket';

@Component({
  selector: 'app-ticket-discount-table',
  templateUrl: './ticket-discount-table.component.html',
  styleUrls: ['./ticket-discount-table.component.scss'],
})
export class TicketDiscountTableComponent implements OnInit {
  @Input() ticketDiscountList: TicketWithDiscounts[];

  @Output("selectChange") selectChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() { }
}
