import { Component, Input, OnInit } from '@angular/core';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';
import { filter, map, Observable, pipe } from 'rxjs';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss'],
})
export class TicketFormComponent implements OnInit {
  @Input() ticket: Ticket;
  @Input() openContracts: Observable<Contract[]>;
  @Input() transportList: Contact[];

  public selectableContracts: Observable<Contract[]>;

  constructor( ) { }

  ngOnInit() {
    // Filter contracts
    let contractTag: string;
    if(this.ticket.in === true) contractTag = 'purchase';
    if(this.ticket.in === false) contractTag = 'sale';

    this.selectableContracts = this.openContracts.pipe(
      map(contracts => contracts.filter(contract => contract.tags.includes(contractTag)))
    );
  }

}
