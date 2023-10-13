import { Component, OnInit, Pipe, PipeTransform, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { collection, doc, Firestore, query, where } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';
import { orderBy } from 'firebase/firestore';
import { lastValueFrom } from 'rxjs';
import { TicketTemplateDirective } from './ticket-template-directive.directive';

@Component({
  selector: 'app-ticket-console',
  templateUrl: './ticket-console.page.html',
  styleUrls: ['./ticket-console.page.scss'],
})
export class TicketConsolePage implements OnInit {
  tickets: Ticket[];
  openContracts: Contract[] = [];
  transportList: Promise<Contact[]>;
  ticketIndex: number = 0;

  @ViewChildren(TicketTemplateDirective) public ticketTemplates: QueryList<TicketTemplateDirective>;

  constructor(
    private session: SessionInfo,
    private db: Firestore,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    Contract.onSnapshot(
      query(Contract.getCollectionReference(this.db, this.session.getCompany()),
        where('status', '==', 'active'), where('plants', 'array-contains', this.session.getPlant()), orderBy('id', 'asc')),
      this.openContracts);

    this.transportList = Contact.getList(this.db, this.session.getCompany(), where('tags', 'array-contains', 'trucker'));
    Ticket.getActiveTickets(this.db, this.session.getCompany(), this.session.getPlant()).then(result => this.tickets = result);
  }

  async newTicketButton() {
    const dialogRef = this.dialog.open(NewTicketDialog);
    const result = await lastValueFrom(dialogRef.afterClosed());
    
    if(result === undefined) return;

    const newTicket = new Ticket(
      doc(collection(this.db, `companies/${this.session.getCompany()}/plants/${this.session.getPlant()}/tickets`)).withConverter(Ticket.converter)
    );
    newTicket.in = result;

    this.tickets.push(newTicket);
    this.ticketIndex = this.tickets.length - 1;
  }

  indexChange(num: number) { 
    let newIndex = this.ticketIndex + num;

    if(newIndex >= this.tickets.length) newIndex = this.tickets.length - 1;
    if(newIndex < 0) newIndex == 0;

    this.ticketIndex = newIndex;
  }
}

@Component({
  selector: 'dialog-new-ticket',
  templateUrl: 'new-ticket.dialog.html',
})
export class NewTicketDialog {
  constructor() {}
}

@Pipe({
  name: 'ticketSelector'
})
export class TicketSelectorPipe implements PipeTransform {
  transform(value: Ticket, list: QueryList<TicketTemplateDirective>, ...args: unknown[]): TemplateRef<any> {
    return list.find(item => item.ticketTemplate == value)?.templateRef;
  }
}