import { Component, Input, OnInit } from '@angular/core';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';
import { firstValueFrom, map, Observable } from 'rxjs';

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

  // Form fields
  public contractId: string;

  constructor( ) { }

  ngOnInit() {
    // Filter contracts
    let contractTag: string;
    if(this.ticket.in === true) contractTag = 'purchase';
    if(this.ticket.in === false) contractTag = 'sale';

    this.selectableContracts = this.openContracts.pipe(
      map(contracts => contracts.filter(contract => contract.tags.includes(contractTag)))
    );

    this.contractId = this.ticket?.contractRef?.id ?? null;
  }

  async contractChange(event: string) { 
    this.contractId = event;
    const contracts = await firstValueFrom(this.selectableContracts);
    const contract = contracts.find(c => c.ref.id == this.contractId);

    this.ticket.contractID = contract.id;
    this.ticket.contractRef = contract.ref.withConverter(Contract.converter);
    this.ticket.PPB = contract.aflatoxin;
    this.ticket.productName = contract.product.id;
    this.ticket.grade = Number(contract.grade);

    this.ticket.clientCity = contract.clientTicketInfo.city;
    this.ticket.clientName = contract.clientTicketInfo.name;
    this.ticket.clientState = contract.clientTicketInfo.state;
    this.ticket.clientStreetAddress = contract.clientTicketInfo.streetAddress;
    this.ticket.clientZipCode = contract.clientTicketInfo.zipCode;
  }

}
