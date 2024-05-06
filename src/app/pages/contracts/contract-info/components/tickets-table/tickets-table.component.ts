import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import { Storage } from '@ionic/storage';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';

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

  constructor() { }

  ngOnInit() {
    console.log(this.contract?.tags)
  }
}
