import { Component, Input, OnInit } from '@angular/core';
import { arrayUnion, Firestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { CompanyContact } from '@shared/classes/company';
import { Contact } from '@shared/classes/contact';
import { Contract, TruckerInfo } from '@shared/classes/contract';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Plant } from '@shared/classes/plant';
import { Ticket, WeightDiscounts } from '@shared/classes/ticket';
import { firstValueFrom, lastValueFrom, map, Observable } from 'rxjs';
import { SelectClientComponent } from 'src/app/modules/contract/select-client/select-client.component';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss'],
})
export class TicketFormComponent implements OnInit {
  @Input() ticket: Ticket;
  @Input() openContracts: Observable<Contract[]>;
  @Input() transportList: CompanyContact[];
  @Input() discountTables: {[product: string]: DiscountTables};
  @Input() plant: Promise<Plant>;

  public selectableContracts: Observable<Contract[]>;
  public selectableTransport: CompanyContact[];

  public contractId: string;
  public currentContract: Contract;

  constructor(
    public dialog: MatDialog,
    public db: Firestore,
    public session: SessionInfo
  ) { }

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
    this.currentContract = contracts.find(c => c.ref.id == this.contractId);

    this.ticket.contractID = this.currentContract.id;
    this.ticket.contractRef = this.currentContract.ref.withConverter(Contract.converter);
    this.ticket.PPB = this.currentContract.aflatoxin;
    this.ticket.productName = this.currentContract.product.id;
    this.ticket.grade = Number(this.currentContract.grade);

    this.ticket.clientCity = this.currentContract.clientTicketInfo.city;
    this.ticket.clientName = this.currentContract.clientTicketInfo.name;
    this.ticket.clientState = this.currentContract.clientTicketInfo.state;
    this.ticket.clientStreetAddress = this.currentContract.clientTicketInfo.streetAddress;
    this.ticket.clientZipCode = this.currentContract.clientTicketInfo.zipCode;

    this.loadTransport()
  }

  async loadTransport() {
    if(this.contractId == null) return;

    const contracts = await firstValueFrom(this.selectableContracts);
    const contract = contracts.find(c => c.ref.id == this.contractId);

    this.selectableTransport = this.transportList.filter(t => contract.truckers.some(ti => ti.trucker.id == t.id));
  }

  calcNetWeight() {
    if(!this.ticket.gross.amount || !this.ticket.tare.amount) return;
    
    this.ticket.net.amount = this.ticket.gross.amount - this.ticket.tare.amount;
    this.calcDiscount();
  }

  calcDiscount() {
    if(!this.ticket.gross.amount || !this.ticket.tare.amount || !this.contractId) return;

    this.ticket.getWeightDiscounts(this.discountTables[this.ticket.productName]);

    let newDryWeight = this.ticket.net;    
    for(const mass of Object.values(this.ticket.weightDiscounts)) {
      newDryWeight = newDryWeight.subtract(mass);
    }

    this.ticket.dryWeight = newDryWeight;
  }

  async tankChange() {
    this.ticket.tankId = (await this.plant).inventoryNames.findIndex(tank => tank == this.ticket.tank);
  }

  async addTransport() {
    const dialogRef = this.dialog.open(SelectClientComponent, {
      data: this.transportList.filter(t => !this.selectableTransport.some(st => st.id == t.id)).sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
      
        return 0;
      })
    });

    const newTransport = await lastValueFrom(dialogRef.afterClosed()) as [CompanyContact];
    if(!newTransport) return;

    const truckerInfo: TruckerInfo = {
      trucker: Contact.getDocReference(this.db, this.session.getCompany(), newTransport[0].id),
      freight: 0,
    };

    this.currentContract.truckers.push(truckerInfo);
    this.selectableTransport = this.transportList.filter(t => this.currentContract.truckers.some(ti => ti.trucker.id == t.id));
    this.ticket.truckerId = truckerInfo.trucker.id;
    this.truckerChange();
    this.currentContract.update({
      truckers: arrayUnion(truckerInfo)
    });
  }

  async truckerChange() {
    const contact = await Contact.getDoc(this.db, this.session.getCompany(), this.ticket.truckerId);
    this.ticket.transportCaat = contact.caat;
    this.ticket.transportCity = contact.city;
    this.ticket.transportName = contact.name;
    this.ticket.transportState = contact.state;
    this.ticket.transportStreetAddress = contact.streetAddress;
    this.ticket.transportZipCode = contact.zipCode;
  }
}