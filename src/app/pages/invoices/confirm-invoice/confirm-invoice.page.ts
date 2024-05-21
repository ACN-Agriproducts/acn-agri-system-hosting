import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Ticket } from '@shared/classes/ticket';
import { Company } from '@shared/classes/company';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { addDoc, Firestore, where } from '@angular/fire/firestore';
import { contactInfo, Invoice, item } from '@shared/classes/invoice';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Contract } from '@shared/classes/contract';
import { Product } from '@shared/classes/product';
import { Contact } from '@shared/classes/contact';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Mass } from '@shared/classes/mass';
import { MatLegacySelectChange } from '@angular/material/legacy-select';


@Component({
  selector: 'app-confirm-invoice',
  templateUrl: './confirm-invoice.page.html',
  styleUrls: ['./confirm-invoice.page.scss'],
})
export class ConfirmInvoicePage implements OnInit {
  public exportClients: Promise<Contact[]>;
  public today: Date = new Date();
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
    private db: Firestore,
    private snack: SnackbarService
  ) { }

  ngOnInit() {
    const currentNavigation = this.router.getCurrentNavigation();
    if(currentNavigation == null) {
      this.router.navigate(["dashboard", "invoices", "new"], {});
      return;
    }

    this.generatePromises = [];

    this.exportClients = Contact.getList(this.db, this.session.getCompany(), where('isExportClient', "==", true));

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
    let totalWeight = new Mass(0, this.session.getDefaultUnit());

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
          price: null,
          totalWeight: 0,
        };
      }
      
      this.generatePromises.push(ticket.getTransport(this.db).then(result => {
        this.groups[ticket.productName][ticket.clientName][driver].transport = result;
      }));

      const object = this.groups[ticket.productName][ticket.clientName][driver];
      object.tickets.push(ticket);
      object.totalWeight += ticket.net.get();
      totalWeight = totalWeight.add(ticket.net);
    });
    
    this.invoice = {
      buyer: {
        city:null,
        country:null,
        name:null,
        phone: null,
        state:null,
        street:null,
        zip: null,
        other:null,
      },
      date: new Date(),
      id: 0,
      items: [],
      status: "pending",
      seller: {
        city: "Progreso",
        country: "US",
        name: "ACN Agriproducts, LLC.",
        phone: "",
        state: "TEXAS",
        street: "1512 Rancho Toluca Rd",
        zip: "78579",
        other: null
      },
      total: 0,
      isExportInvoice: true,
      exportInfo: {
        product: null,
        quantity: totalWeight,
      },
      printableDocumentName: "Document two",
      incoterm: null,
    }
  }

  getConnectedProductGroupList(product: string, client: string, group: string): string[] {
    const connectedList: string[] = Object.keys(this.groups[product][client])
      .filter(f => this.groups[product][client][f].tickets[0]?.truckerId == this.groups[product][client][group].tickets[0]?.truckerId)
      .map(g => `${product}-${client}-${g}`);
    const index = connectedList.findIndex(s => s == `${product}-${client}-${group}`);
    connectedList.splice(index, 1);

    return connectedList;
  }

  drop(event: CdkDragDrop<Ticket[]>) {
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

      this.getItemFromListId(event.previousContainer.id).totalWeight -= (event.item.data as Ticket).getNet().get();
      this.getItemFromListId(event.container.id).totalWeight += (event.item.data as Ticket).getNet().get();
    }
  }

  getItemFromListId(id: string) {
    const steps = id.split('-');
    return this.groups[steps[0]][steps[1]][steps[2]];
  }

  getMetricTonTotal(ticketList: Ticket[]) {
    let totalKilos = 0;
    ticketList.forEach(ticket => {
      totalKilos += Math.round(ticket.getNet().getMassInUnit('kg'));
    });

    return totalKilos / 1000;
  }

  async generateInvoice() {
    await Promise.all(this.generatePromises);
    this.invoice.id = this.companyDoc.nextInvoice;
    const productSet = new Set<string>();
    
    for(let product in this.groups) {
      productSet.add(product);
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
          console.log(ticketGroup.price);
          ticketGroup.price ??= await this.getItemPrice(ticketGroup);
          const nextItem: item = {
            affectsInventory: false,
            details: this.getItemDetails(ticketGroup),
            inventoryInfo: [],
            name: this.getItemName(ticketGroup),
            price: ticketGroup.price,
            quantity: this.getMetricTonTotal(ticketGroup.tickets),
            type: null
          };
          this.invoice.total += Math.round(nextItem.quantity * nextItem.price * 100) / 100;
          this.invoice.items.push(nextItem);
        }
      }
    }

    if(productSet.size == 1) {
      this.invoice.exportInfo.product = productSet.values().next().value;
    }

    this.invoiceCreated = true;

    setTimeout(() => {
      this.invoice.printableDocumentName = "Document two";
    }, 1);
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
      name = name.concat(`${ticket.plates.toUpperCase()}--${(ticket.getNet().getMassInUnit("mTon")).toFixed(3)}`)
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

  deleteGroup(product: string, client: string, group: string) {
    if (this.groups[product][client][group].tickets.length !== 0) {
      this.snack.openTranslated("Group must be empty to be deleted.", "warn");
      return;
    }

    delete this.groups[product][client][group];
  }

  exportClientChange(change: MatLegacySelectChange) {
    const contact = change.value as Contact;
    const buyer = this.invoice.buyer;

    buyer.city = contact.city;
    buyer.country = contact.country;
    buyer.name = contact.name;
    buyer.state = contact.state;
    buyer.street = contact.streetAddress;
    buyer.other = `CP:. ${contact.zipCode}\nRFC: ${contact.rfc}`;
  }

  submit() {
    addDoc(Invoice.getCollectionReference(this.db, this.session.getCompany()), this.invoice)
    .then((result => {
      document.getElementById("print-button").click();
      this.snack.openTranslated("Invoice created", "success");
      this.router.navigate(["dashboard","invoices"]);
    }), reason => {
      console.error(reason);
      this.snack.openTranslated("Error while creating invoice.", "error");
    });
  }
}

interface invoiceInterface {
  buyer: contactInfo;
  date: Date;
  id: number;
  items: item[];
  status: string;
  seller: contactInfo;
  total: number;
  isExportInvoice: boolean;
  exportInfo: {
      product: string;
      quantity: Mass;
  }
  printableDocumentName: string;
  incoterm: string;
}

interface TicketGroup {
  tickets: Ticket[],
  price: number,
  totalWeight: number,
  transport?: Contact,
}