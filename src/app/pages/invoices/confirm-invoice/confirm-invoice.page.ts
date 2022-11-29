import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { Ticket } from '@shared/classes/ticket';
import { Company } from '@shared/classes/company';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Firestore } from '@angular/fire/firestore';
import { Interface } from 'readline';
import { contactInfo, item } from '@shared/classes/invoice';

@Component({
  selector: 'app-confirm-invoice',
  templateUrl: './confirm-invoice.page.html',
  styleUrls: ['./confirm-invoice.page.scss'],
})
export class ConfirmInvoicePage implements OnInit {
  public companyDoc: Company;
  public selectedTickets: Set<Ticket>;
  public invoice: invoiceInterface
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
    private router: Router,
    private session: SessionInfo,
    private db: Firestore
  ) { }

  ngOnInit() {
    const currentNavigation = this.router.getCurrentNavigation();
    if(currentNavigation == null) {
      console.log("return")
      this.router.navigate(["dashboard", "invoices", "new"], {});
      return;
    }

    Company.getCompany(this.db, this.session.getCompany()).then(company => {
      this.companyDoc = company;
      this.invoice.id = company.nextInvoice;
    });

    this.selectedTickets = currentNavigation.extras.state as Set<Ticket>;
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

    this.invoice = {
      buyer: {
        city: null,
        country: null,
        name: null,
        phone: null,
        state: null,
        street: null,
        zip: null
      },
      date: new Date(),
      id: 0,
      items: [],
      seller: {
        city: null,
        country: null,
        name: null,
        phone: null,
        state: null,
        street: null,
        zip: null
      },
      total: 0
    }
  }

}

interface invoiceInterface {
  buyer: contactInfo;
  date: Date;
  id: number;
  items: item[];
  seller: contactInfo;
  total: number;
}