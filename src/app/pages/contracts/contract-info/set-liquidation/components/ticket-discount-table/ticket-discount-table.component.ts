import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { Contract } from '@shared/classes/contract';
import { LiquidationTotals, ReportTicket } from '@shared/classes/liquidation';
import { DiscountTables } from '@shared/classes/discount-tables';
import { PriceDiscounts, Ticket, WeightDiscounts } from '@shared/classes/ticket';
import { SelectedTicketsPipe } from '@shared/pipes/selectedTickets/selected-tickets.pipe';

import * as Excel from 'exceljs';

@Component({
  selector: 'app-ticket-discount-table',
  templateUrl: './ticket-discount-table.component.html',
  styleUrls: ['./ticket-discount-table.component.scss'],
})
export class TicketDiscountTableComponent implements OnInit {
  @Input() ticketList: Ticket[];
  @Output() ticketListChange: EventEmitter<any> = new EventEmitter<any>();

  public ticketDiscountList: ReportTicket[];

  constructor(
    private transloco: TranslocoService,
  ) { }

  ngOnInit() {
    console.log("Ticket discount table")
  }

  ngOnDestroy() {

  }
}
