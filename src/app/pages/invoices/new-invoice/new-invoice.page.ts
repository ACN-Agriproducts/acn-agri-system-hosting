import { Component, OnInit } from '@angular/core';
import { Firestore, getDocs, orderBy, QuerySnapshot, where } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-new-invoice',
  templateUrl: './new-invoice.page.html',
  styleUrls: ['./new-invoice.page.scss'],
})
export class NewInvoicePage implements OnInit {
  public product: string;
  public ticketsPromise: Promise<Ticket[]>;
  public selectedTickets: Set<Ticket>;

  constructor(
    private session: SessionInfo,
    private db: Firestore
  ) { }

  ngOnInit() {
    const today = new Date();
    const requestDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
    this.selectedTickets = new Set<Ticket>;

    this.ticketsPromise = Ticket.getTickets(
      this.db, 
      this.session.getCompany(), 
      this.session.getPlant(),
      where("in", "==", false),
      where("dateOut", ">=", requestDate),
      orderBy("dateOut", "desc"));
  }

  public set(ticket: Ticket) {
    if(this.selectedTickets.has(ticket)) {
      this.selectedTickets.delete(ticket);
    }
    else {
      this.selectedTickets.add(ticket);
    }
  }
}
