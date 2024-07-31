import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog } from '@angular/material/legacy-dialog';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';
import { TicketDialogComponent } from '@shared/printable/printable-ticket/ticket-dialog/ticket-dialog.component';

@Component({
  selector: 'app-tickets-table',
  templateUrl: './tickets-table.component.html',
  styleUrls: ['./tickets-table.component.scss'],
})
export class TicketsTableComponent implements OnInit {
  @Input() ticketList: Ticket[];
  @Input() contract: Contract;
  public displayColumns: string[] = 
    ['id', 'date', 'gross', 'tare', 'net', 'opt'];

  constructor(
    private dialog: MatLegacyDialog
  ) { }

  ngOnInit() {}

  openDialog(ticket: Ticket): void {
    this.dialog.open(TicketDialogComponent, {
      data: ticket,
      panelClass: "borderless-dialog",
      minWidth: "80%",
      maxWidth: "100%",
      height: "75vh"
    })
  }
}
