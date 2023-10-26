import { Component, ElementRef, OnInit, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { collection, collectionData, doc, Firestore, limit, query, where } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company, CompanyContact } from '@shared/classes/company';
import { Contract } from '@shared/classes/contract';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Plant } from '@shared/classes/plant';
import { Product } from '@shared/classes/product';
import { Ticket } from '@shared/classes/ticket';
import { orderBy } from 'firebase/firestore';
import { lastValueFrom, Observable } from 'rxjs';
import { TicketFormComponent } from './components/ticket-form/ticket-form.component';

@Component({
  selector: 'app-ticket-console',
  templateUrl: './ticket-console.page.html',
  styleUrls: ['./ticket-console.page.scss'],
})
export class TicketConsolePage implements OnInit, OnDestroy {
  tickets: Ticket[];
  openContracts: Observable<Contract[]>;
  discountTables: {[product: string]: DiscountTables};
  plant: Promise<Plant>;
  companyDoc: Promise<Company>;
  transportList: CompanyContact[];

  ticketIndex: number = 0;

  @ViewChildren(TicketFormComponent) ticketForms: QueryList<TicketFormComponent>;
  @ViewChild('printButton') public printButton: ElementRef; 

  constructor(
    private session: SessionInfo,
    private db: Firestore,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    // Get open contracts with snapshot
    this.openContracts = collectionData(
      query(Contract.getCollectionReference(this.db, this.session.getCompany()),
        where('status', '==', 'active'), where('plants', 'array-contains', this.session.getPlant()), orderBy('id', 'asc')))

    // Get company doc
    this.companyDoc = Company.getCompany(this.db, this.session.getCompany());
    this.companyDoc.then(company => {
      this.transportList = company.contactList.filter(t => t.tags.some(tag => tag == 'trucker'))
    });

    // Get active tickets
    Ticket.getActiveTickets(this.db, this.session.getCompany(), this.session.getPlant()).then(result => this.tickets = result);

    // Get product discount tables
    Product.getProductList(this.db, this.session.getCompany()).then(async list => {
      const tables = await Promise.all(list.map(p => p.getDiscountTables()));

      this.discountTables = {};
      for(let i = 0; i < list.length; i++) {
        this.discountTables[list[i].ref.id] = tables[i];
      }
    });

    // Get inventory info
    this.plant = Plant.getPlant(this.db, this.session.getCompany(), this.session.getPlant());
  }

  async newTicketButton() {
    const dialogRef = this.dialog.open(NewTicketDialog);
    const result = await lastValueFrom(dialogRef.afterClosed());
    
    if(result === undefined) return;

    const isIn = result == 'in' ? 
                    true : result == "out" ? 
                      false : null;
    const lastTicket = Ticket.getTickets(this.db, this.session.getCompany(), this.session.getPlant(), where('in', '==', isIn), orderBy('id', 'desc'), limit(1));
    const newTicket = new Ticket(
      doc(collection(this.db, `companies/${this.session.getCompany()}/plants/${this.session.getPlant()}/tickets`)).withConverter(Ticket.converter)
    );
    newTicket.in = isIn;
    newTicket.type = result;
    newTicket.id = (await lastTicket)[0].id + 1;

    this.tickets.push(newTicket);
    this.ticketIndex = this.tickets.length - 1;
    newTicket.set();
  }

  indexChange(num: number) { 
    let newIndex = this.ticketIndex + num;

    if(newIndex >= this.tickets.length) newIndex = this.tickets.length - 1;
    if(newIndex < 0) newIndex = 0;

    this.ticketIndex = newIndex;
  }

  currentTicketValid(): boolean {
    const ticket = this.tickets?.[this.ticketIndex];
    if(!ticket) return false;

    return !!ticket.contractRef && !!ticket.driver && !!ticket.gross.amount && !!ticket.tare.amount && !!ticket.moisture && !!ticket.weight && !!ticket.tank;
  }

  async print() {
    this.tickets[this.ticketIndex].dateOut = new Date();
    setTimeout(() => {
      this.printButton.nativeElement.click();
      this.submit();
    }, 20);
  }

  submit() {
    this.tickets[this.ticketIndex].status = 'closed'; // Set ticket as closed
    clearTimeout(this.ticketForms.find(form => form.ticket == this.tickets[this.ticketIndex]).saveTimeout); // Clear save timer if there is any
    this.tickets[this.ticketIndex].set(); // Save ticket
    this.tickets.splice(this.ticketIndex, 1); // Remove from list
    this.indexChange(0); // Make sure index is within bounds
      }

  ngOnDestroy(): void {
    this.ticketForms.forEach(form => clearTimeout(form.saveTimeout));
    this.tickets.forEach(ticket => ticket.set());
  }
}

@Component({
  selector: 'dialog-new-ticket',
  templateUrl: 'new-ticket.dialog.html',
})
export class NewTicketDialog {
  constructor() {}
}