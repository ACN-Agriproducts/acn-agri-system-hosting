import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { Storage } from '@ionic/storage';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-tickets-table',
  templateUrl: './tickets-table.component.html',
  styleUrls: ['./tickets-table.component.scss'],
})
export class TicketsTableComponent implements OnInit {

  @Input() ticketList: Ticket[];
  public displayColumns: string[] = 
    ['id', 'date', 'gross', 'tare', 'net', 'opt'];

  constructor() { }

  ngOnInit() {
  }
}
