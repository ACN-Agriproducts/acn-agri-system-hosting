import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, doc, query, where } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company, CompanyContact } from '@shared/classes/company';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Plant } from '@shared/classes/plant';
import { Ticket } from '@shared/classes/ticket';
import { Observable, filter, map } from 'rxjs';

@Component({
  selector: 'app-new-ticket-modal',
  templateUrl: './new-ticket-modal.component.html',
  styleUrls: ['./new-ticket-modal.component.scss'],
})
export class NewTicketModalComponent implements OnInit {
  ticket: Ticket;
  plants: Promise<Plant[]>;
  contracts: Promise<Contract[]>;
  company: Promise<Company>;
  
  selectableContracts: Contract[];
  driverList: CompanyContact[];

  chosenPlant: Plant;
  currentContract: Contract;
  currentDriver: CompanyContact;

  constructor(
    private session: SessionInfo,
    private db: Firestore,
  ) { }

  ngOnInit() {
    const company = this.session.getCompany();
    this.ticket = new Ticket(doc(this.db, company, 'plants'));
    this.plants = Plant.getPlantList(this.db, company);
    this.contracts = Contract.getContracts(this.db, company, null, where('status', '==', 'active'));
    this.company = this.session.getCompanyObject();
    this.driverList = [];
  }

  async contractChange() {
    console.log(this.currentContract);

    this.ticket.contractID = this.currentContract?.id;
    this.ticket.contractRef = this.currentContract?.ref.withConverter(Contract.converter);
    this.ticket.PPB = this.currentContract?.aflatoxin;
    this.ticket.productName = this.currentContract?.product.id;
    this.ticket.grade = Number(this.currentContract?.grade);

    this.ticket.clientRef = this.currentContract?.client;
    this.ticket.clientCity = this.currentContract?.clientTicketInfo?.city;
    this.ticket.clientName = this.currentContract?.clientTicketInfo?.name;
    this.ticket.clientState = this.currentContract?.clientTicketInfo?.state;
    this.ticket.clientStreetAddress = this.currentContract?.clientTicketInfo?.streetAddress;
    this.ticket.clientZipCode = this.currentContract?.clientTicketInfo?.zipCode;

    this.driverList = (await this.company).contactList.filter(c => this.currentContract.truckers.some(t => t.trucker.id == c.id));
  }

  async transportChange() {
    const contact = await Contact.getDoc(this.db, this.session.getCompany(), this.ticket.truckerId);
    this.ticket.transportCaat = contact?.caat;
    this.ticket.transportCity = contact?.city;
    this.ticket.transportName = contact?.name;
    this.ticket.transportState = contact?.state;
    this.ticket.transportStreetAddress = contact?.streetAddress;
    this.ticket.transportZipCode = contact?.zipCode;
  }

  async ticketTypeChange() {
    this.selectableContracts = (await this.contracts).filter(c => c.tags.includes('purchase') && this.ticket.type == 'in' || c.tags.includes('sale') && this.ticket.type == 'out');
  }

  submit() {
    this.ticket.in = this.ticket.type == 'in';
    this.ticket.ref = doc(collection(this.chosenPlant.ref, 'tickets'));
  }
}
