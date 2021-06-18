import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { MatTable } from '@angular/material/table';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-tickets-table',
  templateUrl: './tickets-table.component.html',
  styleUrls: ['./tickets-table.component.scss'],
})
export class TicketsTableComponent implements OnInit {

  @Input() ticketRefList: DocumentReference[];
  public ticketList: any[] = [];
  public displayColumns: string[] = 
    ['id', 'date', 'gross', 'tare', 'net', 'opt'];
  @ViewChild(MatTable) table: MatTable<any>

  constructor() { }

  ngOnInit() {
    this.ticketRefList.forEach(ticketRef => {
      let counter = 0;

      ticketRef.get().then(val => {
        this.ticketList.push(val.data());

        if(this.ticketList.length == this.ticketRefList.length) {
          this.table.renderRows();
          console.log(this.table);
          console.log("Ticket table done");
        }
      })
    })
  }
}
