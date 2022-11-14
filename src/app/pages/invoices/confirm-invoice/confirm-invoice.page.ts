import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-confirm-invoice',
  templateUrl: './confirm-invoice.page.html',
  styleUrls: ['./confirm-invoice.page.scss'],
})
export class ConfirmInvoicePage implements OnInit {
  public selectedTickets: Set<Ticket>;
  public groups: {
    [product: string]: {
      [client: string]: {
        tickets: Ticket[],
        price: number,
        totalWeight: number
      }
    }
  }

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.selectedTickets = this.router.getCurrentNavigation().extras.state as Set<Ticket>;
    this.groups = {};

    this.selectedTickets.forEach(ticket => {
      if(!this.groups[ticket.productName]) {
        this.groups[ticket.productName] = {};
      }

      if(!this.groups[ticket.productName][ticket.clientName]) {
        this.groups[ticket.productName][ticket.clientName] = {
          tickets: [],
          price: 0,
          totalWeight: 0
        };
      }

      const object = this.groups[ticket.productName][ticket.clientName];
      object.tickets.push(ticket);
      object.totalWeight += ticket.gross - ticket.tare;
    });
  }

}
