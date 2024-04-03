import { Component, OnInit } from '@angular/core';
import { Firestore, getDocs, limit, onSnapshot, orderBy, where, writeBatch } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
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

  public ticketList: Ticket[];
  public ticketsToUpload: Set<Ticket>;

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private snack: SnackbarService
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
    this.ticketsToUpload = new Set<Ticket>;
    
    const colRef = Ticket.getCollectionReference(this.db, this.session.getCompany(), this.session.getPlant(), 
      where('in', '==', this.inTicket),
      where('id', '<', this.ticketRangeUpper * 100), 
      where('id', '>=', (this.ticketRangeUpper - 1) * 100), 
      orderBy('id', 'desc')); 

    this.ticketList = (await getDocs(colRef)).docs.map(d => d.data());
  }

  submit() {
    const batch = writeBatch(this.db);
    
    for(let ticket of this.ticketsToUpload) {
      batch.update(ticket.ref, {
        original_weight: ticket.original_weight.amount,
        original_weight_unit: ticket.original_weight.defaultUnits,
      });
    }

    this.snack.open('Submitting...', "info");
    batch.commit().then(() => {
      this.snack.open("Tickets successfully updated.", "success");
    }).catch(error => {
      console.error(error);
      this.snack.open("Error submitting.", "error");
    });
  }
}