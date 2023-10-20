import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CompanyContact } from '@shared/classes/company';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Plant } from '@shared/classes/plant';
import { Ticket, WeightDiscounts } from '@shared/classes/ticket';
import { firstValueFrom, map, Observable } from 'rxjs';
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

  constructor(public dialog: MatDialog) { }

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
    this.dialog.open(SelectClientComponent, {
      data: this.transportList.filter(t => !this.selectableTransport.some(st => st.id == t.id))
    })
  }
}
