import { Component, OnInit, Input } from '@angular/core';
import { DocumentReference, getDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dpr-tickets-table',
  templateUrl: './dpr-tickets-table.component.html',
  styleUrls: ['./dpr-tickets-table.component.scss'],
})
export class DprTicketsTableComponent implements OnInit {
  @Input() ticketList: DocumentReference[] = [];
  @Input() bushelWeight: number = 1;
  @Input() title: string;
  public ticketData: any[];

  public displayedColumns: string[] = ['id', 'client', 'net']
  
  public ready: boolean = false;

  constructor() {}

  async ngOnInit() {
    this.ticketData = [];

    this.ticketList.forEach(ticketRef => {
      this.ticketData.push(
        getDoc(ticketRef).then(val => {
          return val.data();
        })
      );
    });

    this.ticketData = await Promise.all(this.ticketData);

    this.ticketData = this.ticketData.filter(t => !t.void);
    this.ready = true;
  }

  getTotalWeight():number {
    let counter = 0;

    for(const x of this.ticketData) {
      if(x.clientName == 'VOID'){
        continue;
      }
      
      counter += x.dryWeight;
    }
    return counter;
  }
}
