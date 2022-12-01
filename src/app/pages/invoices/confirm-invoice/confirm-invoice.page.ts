import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Ticket } from '@shared/classes/ticket';
import { Company } from '@shared/classes/company';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Firestore } from '@angular/fire/firestore';
import { contactInfo, item } from '@shared/classes/invoice';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Contract } from '@shared/classes/contract';
import { Product } from '@shared/classes/product';
import { Contact } from '@shared/classes/contact';


@Component({
  selector: 'app-confirm-invoice',
  templateUrl: './confirm-invoice.page.html',
  styleUrls: ['./confirm-invoice.page.scss'],
})
export class ConfirmInvoicePage implements OnInit {
  public companyDoc: Company;
  public selectedTickets: Set<Ticket>;
  public printTicketDocs: [Ticket, Contract, Contact, Contact][];
  public contracts: Map<number, Promise<Contract>>;
  public products: Product[];
  public invoice: invoiceInterface;
  public invoiceCreated: boolean = false;
  public groups: {
    [product: string]: {
      [client: string]: {
        [group: string]: TicketGroup
      }
    }
  }

  private generatePromises: Promise<any>[];

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

    this.generatePromises = [];

    this.generatePromises.push(Company.getCompany(this.db, this.session.getCompany()).then(company => {
      this.companyDoc = company;
      this.invoice.id = company.nextInvoice;
    }));
    this.generatePromises.push(Product.getProductList(this.db, this.session.getCompany()).then(result => {
      this.products = result;
    }));

    this.selectedTickets = currentNavigation.extras.state as Set<Ticket>;
    this.groups = {};
    this.contracts = new Map();
    this.printTicketDocs = [];

    this.selectedTickets.forEach(ticket => {
      this.generatePromises.push(ticket.getPrintDocs(this.db).then(docs => {
        this.printTicketDocs.push(docs);
      }));

      if(!this.contracts.has(ticket.contractID)) {
        this.contracts.set(ticket.contractID, ticket.getContract(this.db));
      }

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
        city: "Valle Hermoso",
        country: "Mexico",
        name: "Agropecuaria la Capilla del Noreste SA de CV",
        phone: null,
        state: "Tamaulipas",
        street: "Zaragosa S/N Colonia Centro",
        zip: null,
        other: "CP:. 87500\nRFC: ACN 980211QC9"
      },
      date: new Date(),
      id: 0,
      items: [],
      seller: {
        city: "Progreso",
        country: null,
        name: "ACN Agriproducts, LLC.",
        phone: null,
        state: "TEXAS",
        street: "1512 Rancho Toluca Rd",
        zip: "78579",
        other: null
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
      
      console.log(event.item.data);

      this.getItemFromListId(event.previousContainer.id).totalWeight -= (event.item.data as Ticket).getNet();
      this.getItemFromListId(event.container.id).totalWeight += (event.item.data as Ticket).getNet();
    }
  }

  getItemFromListId(id: string) {
    const steps = id.split('-');
    return this.groups[steps[0]][steps[1]][steps[2]];
  }

  getMetricTonTotal(ticketList: Ticket[]) {
    let totalKilos = 0;
    ticketList.forEach(ticket => {
      totalKilos += Math.round(ticket.getNet() / 2.20462);
    });

    return totalKilos / 1000;
  }

  async generateInvoice() {
    await Promise.all(this.generatePromises);
    this.invoice.id = this.companyDoc.nextInvoice;
    
    for(let product in this.groups) {
      this.invoice.items.push({
        affectsInventory: false,
        details: null,
        inventoryInfo: [],
        name: product,
        price: null,
        quantity: null,
        type: "label"
      });
      for(let client in this.groups[product]) {
        for(let group in this.groups[product][client]){
          const ticketGroup = this.groups[product][client][group];
          const nextItem: item = {
            affectsInventory: false,
            details: this.getItemDetails(ticketGroup),
            inventoryInfo: [],
            name: this.getItemName(ticketGroup),
            price: await this.getItemPrice(ticketGroup),
            quantity: this.getMetricTonTotal(ticketGroup.tickets),
            type: null
          };
          this.invoice.total += Math.round(nextItem.quantity * nextItem.price * 100) / 100;
          this.invoice.items.push(nextItem);
        }
      }
    }

    this.invoiceCreated = true;
  }

  getItemDetails(group: TicketGroup): string {
    let tickets = "";
    group.tickets.forEach((ticket, index) => {
      tickets = tickets.concat(ticket.id.toString());
      if(index != group.tickets.length - 1) {
        tickets = tickets.concat(', ');
      }
    });
    
    return `CONTRACT# ${group.tickets[0].contractID}\tTICKETS# ${tickets}`;
  }

  getItemName(group: TicketGroup): string {
    let name = "";
    group.tickets.forEach((ticket, index) => {
      name = name.concat(`${ticket.plates.toUpperCase()}--${(ticket.getNet()/2204.62).toFixed(3)}`)
      if(index != group.tickets.length - 1) {
        name = name.concat('  ');
      }
    });

    return name;
  }

  async getItemPrice(group: TicketGroup): Promise<number> {
    const contract = await this.contracts.get(group.tickets[0].contractID);
    const product = this.products.find(p => p.getName() == group.tickets[0].productName);
    const mTonPrice = contract.pricePerBushel / product.weight * 2204.62;
    return Math.round(mTonPrice * 100) / 100;
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

interface TicketGroup {
  tickets: Ticket[],
  price: number,
  totalWeight: number
}