import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { arrayUnion, Firestore } from '@angular/fire/firestore';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { CompanyContact } from '@shared/classes/company';
import { Contact } from '@shared/classes/contact';
import { Contract, TruckerInfo } from '@shared/classes/contract';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Mass } from '@shared/classes/mass';
import { Plant } from '@shared/classes/plant';
import { Ticket, WeightDiscounts } from '@shared/classes/ticket';
import { firstValueFrom, groupBy, lastValueFrom, map, Observable } from 'rxjs';
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

  public selectableContracts: Observable<GroupedContracts>;
  public selectableTransport: CompanyContact[];

  public contractId: string;
  public currentContract: Contract;

  public saveTimeout: NodeJS.Timeout;
  public discountChangeFlag: boolean = false;

  constructor(
    public dialog: MatDialog,
    public db: Firestore,
    public session: SessionInfo
  ) { }

  ngOnInit() {
    // Filter contracts
    let contractTags: string[];
    if(this.ticket.in === true) contractTags = ['purchase', 'service'];
    if(this.ticket.in === false) contractTags = ['sale', 'service'];

    this.selectableContracts = this.openContracts.pipe(
      map(contracts => contracts.filter(contract => contract.tags.some(t => contractTags.includes(t)))),
      this.groupContract()
    );

    this.contractId = this.ticket?.contractRef?.id ?? null;

    firstValueFrom(this.selectableContracts).then(contracts => {
      this.currentContract = this.findContract(contracts, this.contractId);  
    });

    this.loadTransport();
  }

  async contractChange() { 
    const contracts = await firstValueFrom(this.selectableContracts);
    this.currentContract = this.findContract(contracts, this.contractId);

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

    this.loadTransport()
    this.saveTicket();
  }

  async loadTransport() {
    if(this.contractId == null) return;

    const contracts = await firstValueFrom(this.selectableContracts);
    const contract = this.findContract(contracts, this.contractId);

    this.selectableTransport = this.transportList.filter(t => contract.truckers.some(ti => ti.trucker.id == t.id));
  }

  calcNetWeight() {
    if(this.ticket.gross.amount == null || this.ticket.tare.amount == null) return;
    
    this.ticket.net.amount = Math.round((this.ticket.gross.amount - this.ticket.tare.amount) * 1000) / 1000;
    this.calcDiscount();
  }

  calcDiscount() {
    this.saveTicket();
    if(this.ticket.gross.amount == null || this.ticket.tare.amount == null || !this.contractId) return;

    this.ticket.setDiscounts(this.discountTables[this.ticket.productName]);
    this.discountChangeFlag = !this.discountChangeFlag;

    let newDryWeight = this.ticket.net;    
    for(const mass of Object.values(this.ticket.weightDiscounts)) {
      newDryWeight = newDryWeight.subtract(mass);
    }

    this.ticket.dryWeight = newDryWeight;
  }

  async tankChange() {
    this.ticket.tankId = (await this.plant).inventoryNames.findIndex(tank => tank == this.ticket.tank);
    this.saveTicket();
  }

  async addTransport() {
    const dialogRef = this.dialog.open(SelectClientComponent, {
      width: '600px',
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
      freight: this.currentContract.default_freight ?? 0,
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
    this.ticket.transportCaat = contact?.caat;
    this.ticket.transportCity = contact?.city;
    this.ticket.transportName = contact?.name;
    this.ticket.transportState = contact?.state;
    this.ticket.transportStreetAddress = contact?.streetAddress;
    this.ticket.transportZipCode = contact?.zipCode;

    this.saveTicket();
  }

  saveTicket() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.ticket.set(), 5000);
  }

  groupContract() 
  {
    return function(source: Observable<Contract[]>): Observable<GroupedContracts> {
      return new Observable(subscriber => {
        source.subscribe({
          next(value) {
            const groupedContracts: GroupedContracts = {};
            value.forEach(contract => {
              if(!groupedContracts[contract.type]) groupedContracts[contract.type] = [];
              groupedContracts[contract.type].push(contract);
            });
  
            subscriber.next(groupedContracts)
          }
        })
      }) 
    }
  }

  findContract(contractsGroup: GroupedContracts, contractID: string): Contract {
    for(let type in contractsGroup) {
      for(let contract of contractsGroup[type]) {
        if(contract.ref.id == contractID) return contract;
      }
    }
  }
}

interface GroupedContracts {
  [type: string]: Contract[]
}

@Pipe({
  name: 'discountIterator',
  pure: true,
})
export class WeightDiscountIteratorPipe implements PipeTransform {

  transform(value: WeightDiscounts, ...args: any[] ): {[name: string]: Mass} {
    const data = {};
    for (const key of Object.keys(value)) {
        data[key] = value[key];
    }

    console.log(data);
    return data;
  }

}