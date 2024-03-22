import { Component, OnInit } from '@angular/core';
import { Firestore, limit, onSnapshot, orderBy, where } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-tickets-client-weight',
  templateUrl: './tickets-client-weight.page.html',
  styleUrls: ['./tickets-client-weight.page.scss'],
})
export class TicketsClientWeightPage implements OnInit {
  public inTicket: boolean = false;
  public idRangeList: number[];
  public ticketRangeUpper: number;

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.getTickets();
  }

  async getTickets(){
    const lastIdPromise = Ticket.getTickets(this.db, this.session.getCompany(), this.session.getPlant(), where('in', '==', this.inTicket), orderBy('id', 'desc'), limit(1));
    const lastId = (await lastIdPromise)[0].id;
    this.ticketRangeUpper = Math.floor(lastId / 100) + 1;
    this.idRangeList = Array(this.ticketRangeUpper).fill(0).map((x, i) => this.ticketRangeUpper - i);

    this.ticketIdSort();
  }

  async ticketIdSort() {
    const colRef = Ticket.getCollectionReference(this.db, this.session.getCompany(), this.session.getPlant(), 
      where('in', '==', this.inTicket),
      where('id', '<', this.ticketRangeUpper * 100), 
      where('id', '>=', (this.ticketRangeUpper - 1) * 100), 
      orderBy('id', 'desc')); 
  }
}
