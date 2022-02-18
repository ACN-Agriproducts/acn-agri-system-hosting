import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { MatTable } from '@angular/material/table';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-tickets-table',
  templateUrl: './tickets-table.component.html',
  styleUrls: ['./tickets-table.component.scss'],
})
export class TicketsTableComponent implements OnInit {

  public ticketList: any[] = [];
  public displayColumns: string[] = 
    ['id', 'date', 'gross', 'tare', 'net', 'opt'];
  @ViewChild(MatTable) table: MatTable<any>

  constructor() { }

  ngOnInit() {}

  public renderComponent (ticketList: any[]): void {
    this.ticketList = ticketList;
  }
}
