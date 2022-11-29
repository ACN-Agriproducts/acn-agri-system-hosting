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
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';


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
        [group: string]: {
          tickets: Ticket[],
          price: number,
          totalWeight: number
        }
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
      const driver = ticket.driver.toUpperCase().replace(/\s*\d*\s*$/, '').replace(/\s{2,}/, ' ');

      if(!this.groups[ticket.productName]) {
        this.groups[ticket.productName] = {};
      }

      if(!this.groups[ticket.productName][ticket.clientName]) {
        this.groups[ticket.productName][ticket.clientName] = {};
      }

      if(!this.groups[ticket.productName][ticket.clientName][driver]) {
        this.groups[ticket.productName][ticket.clientName][driver] = {
          tickets: [],
          price: 0,
          totalWeight: 0
        };
      }

      const object = this.groups[ticket.productName][ticket.clientName][driver];
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

  getConnectedProductGroupList(product: string, client: string, group: string): string[] {
    const connectedList: string[] = Object.keys(this.groups[product][client]).map(g => `${product}-${client}-${g}`);
    const index = connectedList.findIndex(s => s == `${product}-${client}-${group}`);
    connectedList.splice(index, 1);

    return connectedList;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
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