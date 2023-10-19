import { Component, Input, OnInit } from '@angular/core';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Ticket, WeightDiscounts } from '@shared/classes/ticket';
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
  @Input() discountTables: {[product: string]: DiscountTables};

  public selectableContracts: Observable<Contract[]>;
  public selectableTransport: Contact[];

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
    this.loadTransport();
  }

  async contractChange() { 
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

    this.loadTransport()
  }

  async loadTransport() {
    if(this.contractId == null) return;

    const contracts = await firstValueFrom(this.selectableContracts);
    const contract = contracts.find(c => c.ref.id == this.contractId);

    this.selectableTransport = this.transportList.filter(t => contract.truckers.some(ti => ti.trucker.id == t.ref.id));
  }

  calcNetWeight() {
    if(!this.ticket.gross.amount || !this.ticket.tare.amount) return;
    
    this.ticket.net.amount = this.ticket.gross.amount - this.ticket.tare.amount;
    this.calcDiscount();
  }

  calcDiscount() {
    if(!this.ticket.gross.amount || !this.ticket.tare.amount || !this.contractId) return;

    const discounts = new WeightDiscounts(this.ticket, this.discountTables[this.ticket.productName]);
    console.log(this.discountTables[this.ticket.productName], discounts);
  }
}
