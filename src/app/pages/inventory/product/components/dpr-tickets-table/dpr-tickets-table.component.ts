import { Component, OnInit, Input } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dpr-tickets-table',
  templateUrl: './dpr-tickets-table.component.html',
  styleUrls: ['./dpr-tickets-table.component.scss'],
})
export class DprTicketsTableComponent implements OnInit {
  @Input() ticketList: any[] = [];
  @Input() bushelWeight: number = 1;
  @Input() title: string;
  public ticketData: any[];

  public displayedColumns: string[] = ['id', 'client', 'net']
  
  private currentSub: Subscription[] = [];
  public ready: boolean = false;

  constructor() {}

  ngOnInit() {
    this.ticketData = new Array<any>(this.ticketList.length);
    let counter = 0;

    if(this.ticketData.length == 0) {
      this.ready = true;
    }

    this.ticketList.forEach((ticket, index) => {
      let ticketRef = ticket as DocumentReference<any>;

      ticketRef.get().then(val => {
        this.ticketData[index] = val.data();
        counter++;

        if(counter == this.ticketData.length){
          this.ready = true;
        }
      });
    })}

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
