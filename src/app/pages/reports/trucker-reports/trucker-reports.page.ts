import { Component, Inject, OnInit } from '@angular/core';
import { Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Mass, units } from '@shared/classes/mass';
import { Plant } from '@shared/classes/plant';
import { Price } from '@shared/classes/price';
import { Ticket } from '@shared/classes/ticket';
import { utils, WorkBook, writeFile } from 'xlsx';

@Component({
  selector: 'app-trucker-reports',
  templateUrl: './trucker-reports.page.html',
  styleUrls: ['./trucker-reports.page.scss'],
})
export class TruckerReportsPage implements OnInit {
  private currentCompany: string;
  public plantList: Plant[];
  public chosenPlants: Plant[];
  public startDate: Date;
  public endDate: Date;
  public startFreight: number = 0;
  public InTicketsOnly: boolean = false;
  public freightUnit: units = "CWT";
  public _tolerance: number = 0.2;
  public tolerance: number;
  public exchangeRate: number = 1;

  public contractsMap: Map<string, Promise<Contract>>

  public transportList: transportGroup[];
  public printableTicketsDone: number = 0;
  public ticketsBoxChecked: boolean = false;

  constructor(
    private db: Firestore,
    private dialog: MatDialog,
    private session: SessionInfo
  ) {}

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
    Plant.getPlantList(this.db, this.currentCompany).then(result => {
      this.plantList = result;
      this.chosenPlants = result;
    });
  }

  public async getTickets(): Promise<void> {
    const ticketList: Ticket[] = [];
    const promises: Promise<any>[] = [];
    this.endDate.setHours(23, 59, 59, 999);

    this.contractsMap = new Map<string, Promise<Contract>>;
    this.tolerance = this._tolerance;

    this.chosenPlants.forEach(plant => {
      const promise = getDocs(query(plant.getTicketCollectionReference(),
        where('dateOut', '>=', this.startDate),
        where('dateOut', '<=', this.endDate))).then(result =>{ 
        result.forEach(snap => {
          const ticket = snap.data();

          if(ticket.void || this.InTicketsOnly && !ticket.in) {
            return;
          }

          if(!this.contractsMap.has(ticket.contractRef.id)) {
            this.contractsMap.set(ticket.contractRef.id, ticket.getContract(this.db))
          }

          ticketList.push(ticket);
        });
      });

      promises.push(promise);
    });

    await Promise.all(promises);

    const tempTransportList: transportGroup[] = [];

    ticketList.forEach(async ticket => {
      let transport = tempTransportList.find(t => t.id == ticket.truckerId);

      if(transport == null){ 
        transport = new transportGroup(ticket.truckerId, this.currentCompany, this.db);
        tempTransportList.push(transport);
      }

      let trucker = transport.getDriver(ticket.driver);

      if(trucker == null) {
        trucker = transport.addDriver(ticket.driver);
      }

      const contract = await this.contractsMap.get(ticket.contractRef.id);
      const ticketFreight = contract.truckers.find(t => t.trucker.id == ticket.truckerId)?.freight;
      trucker.addTicket(ticket, (ticketFreight ? new Price(ticketFreight, 'CWT') : new Price(this.startFreight, this.freightUnit)), contract, this.tolerance, this.exchangeRate); 
    });

    tempTransportList.forEach(transport => {
      transport.drivers.sort((a, b) => {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      });
    });

    this.ticketsBoxChecked = false;
    this.transportList = tempTransportList;
  }

  // TODO
  public mergeTruckers(transport: transportGroup): void {
    const checkedTruckers = transport.getCheckedDrivers();

    this.dialog.open(DialogChooseName, {
      data: checkedTruckers
    }).afterClosed().toPromise().then((name: string) => {
      if(!name) {
        return;
      }

      const tempTruckerList = transport.drivers.filter(t => !checkedTruckers.some(trucker => trucker.name == t.name));
      tempTruckerList.push(truckerTickets.merge(name.toUpperCase().trim(), ...checkedTruckers));
      tempTruckerList.sort((a, b) => {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      });

      transport.drivers = tempTruckerList;
    });
  }

  public download(): void {
    const tableCollection = document.getElementsByClassName("trucker-table");
    const workBook: WorkBook = utils.book_new();

    for(let i = 0; i < tableCollection.length; i++) {
      const table = tableCollection[i];
      const workSheet = utils.table_to_sheet(table);
      utils.book_append_sheet(workBook, workSheet, table.id);
    }

    const today = new Date();
    writeFile(workBook, 'trucker-report' + today.toDateString() + ".xlsx");
  }

  public getTruckerPrintableTickets(): void {
    this.ticketsBoxChecked = true;

    this.transportList.forEach(transport => {
      transport.drivers.forEach(trucker => {
        trucker.getPrintableTicketInfo(this.db).then(result => {
          this.printableTicketsDone += trucker.getTicketAmount();
        });
      });
    });
  }

  public getCheckedTruckersOnly(): truckerTickets[] {
    const list = [];

    this.transportList.forEach(transport => {
      if(transport.someChecked()){
        list.push(...transport.getCheckedDrivers());
      }
    });

    if(list.length == 0){
      this.transportList.forEach(transport => {
        list.push(...transport.drivers);
      });
    }

    return list;
  }

  public getTicketAmount(): number {
    let total = 0;

    this.transportList.forEach(transport => {
      total += transport.getTicketAmount();
    });

    return total;
  }

  public saveTicketFreights(): void {
    console.log('uploading')

    const ticketArray = this.getCheckedTruckersOnly().map(truckers => truckers.getCheckedTickets());
    const tickets: ticketCheck[] = [];
    ticketArray.forEach(ticketList => tickets.push(...ticketList));

    tickets.forEach(checkedTicket => {
      checkedTicket.ticket.update({
        freight: checkedTicket.freight.amount,
        freightUnit: checkedTicket.freight.unit,
      })
    })
  }
}

@Component({
  selector: 'dialog-choose-name',
  templateUrl: './dialog-choose-name.html'
})
export class DialogChooseName {
  public name: string;

  constructor(
    public dialogRef: MatDialogRef<DialogChooseName>,
    @Inject(MAT_DIALOG_DATA) public truckerList: truckerTickets[] 
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}
class transportGroup { 
  public transport: Contact;
  public id: string;
  public drivers: truckerTickets[];

  constructor(_id: string, company: string, db: Firestore) {
    this.id = _id;
    this.drivers = [];

    Contact.getDoc(db, company, _id).then(result => {
      this.transport = result;
    });
  }

  public addDriver(name: string): truckerTickets {
    const driver = new truckerTickets(name);
    this.drivers.push(driver);
    return driver;
  }

  public getDriver(name: string): truckerTickets {
    return this.drivers.find(t => t.name == name.toUpperCase().replace(/\s*\d*\s*$/, '').replace(/\s{2,}/, ' '))
  }

  public getCheckedDrivers(): truckerTickets[] {
    const checked = this.drivers.filter(d => d.checked);

    if(checked.length == 0) {
      return this.drivers;
    }

    return checked;
  }

  public someChecked(): boolean {
    return this.drivers.some(d => d.checked);
  }

  public getTicketAmount(): number {
    let total = 0;

    this.drivers.forEach(driver => {
      total += driver.getTicketAmount();
    });

    return total;
  }
}

class truckerTickets {
  public name: string;
  public checked: boolean;
  public tickets: ticketCheck[];
  public printableTicketInfo: [Ticket, Contract, Contact, Contact][];

  constructor(_name: string) {
    this.name = _name.toUpperCase().replace(/\s*\d*\s*$/, '').replace(/\s{2,}/, ' ');
    this.tickets = [];
    this.printableTicketInfo = [];
    this.checked = false;
  }

  addTicket(ticket: Ticket, freight: Price, contract: Contract, tolerance: number, exchangeRate: number) {
    this.tickets.push(new ticketCheck(ticket, freight, contract, tolerance, exchangeRate));
  }

  public getPrintableTicketInfo(db: Firestore): Promise<void> {
    const printableInfo: Promise<[Ticket, Contract, Contact, Contact]>[] = [];

    this.tickets.forEach(ticket => {
      printableInfo.push(ticket.ticket.getPrintDocs(db));
    });

     return Promise.all<[Ticket, Contract, Contact, Contact]>(printableInfo).then(result => {
      this.printableTicketInfo = result;
    });
  }
  
  public someChecked(): boolean {
    const numChecked = this.tickets.filter(t => t.checked).length;

    return numChecked < this.tickets.length && numChecked > 0;
  }

  public updateChecked(): void {
    if(this.tickets.some(t => t.checked)) {
      this.checked = true;
      return;
    }

    this.checked = false;
  }

  public getCheckedTickets(): ticketCheck[] {
    const list = this.tickets.filter(t => t.checked);

    if(list.length == 0) {
      return this.tickets;
    }

    return list;
  }

  public setAll(value: boolean): void {
    this.tickets.forEach(ticket => {
      ticket.checked = value;
    });

    this.checked = value;
  }

  public getWeightTotal(): number {
    let total: number = 0;

    this.tickets.forEach(ticket => {
      if(ticket.checked){
        total += ticket.ticket.getNet().get();
      }
    })

    return total;
  }

  public getFreightTotal(): number {
    let total: number = 0;
    const ticketList = this.getCheckedTickets();

    ticketList.forEach(ticket => {
      total += ticket.getFreight();
    })

    return total;
  }

  public getTicketAmount(): number {
    return this.tickets.length;
  }

  public changeAllFreight(freight: number): void {
    this.tickets.forEach(ticket => {
      ticket.freight.amount = freight;
    })
  }

  static merge(name: string, ...truckers: truckerTickets[]): truckerTickets {
    const newTrucker = new truckerTickets(name);
    newTrucker.checked = true;

    truckers.forEach(trucker => {
      newTrucker.tickets.push(...trucker.tickets);
      newTrucker.printableTicketInfo.push(...trucker.printableTicketInfo);
    });

    return newTrucker;
  }

  public getTotalWeight(): Mass {
    const ticketList = this.getCheckedTickets();
    if(ticketList.length == 0) return new Mass(0, 'kg');

    const firstTicket = ticketList[0];
    let total = firstTicket.ticket.net;
    
    for(let i = 1; i < ticketList.length; i++) {
      total = total.add(ticketList[i].ticket.net);
    }

    return total;
  } 

  public getDiscountedTotal(): number {
    let total = 0;
    const ticketList = this.getCheckedTickets();

    ticketList.forEach(cTicket => {
      total += cTicket.getDiscountedFreight();
    });

    return total;
  }
}

class ticketCheck {
  public ticket: Ticket;
  public checked: boolean;
  public freight: Price;
  public contract: Contract;
  public tolerance: number;

  constructor(_ticket: Ticket, freight: Price, contract: Contract, tolerance: number, public exchangeRate: number ) {
    this.ticket = _ticket;
    this.freight = freight;
    this.contract = contract;
    this.tolerance = tolerance;
  }

  public getDescription(): string {
    return `${this.ticket.in? 'IN' : 'OUT'} TICKET ${this.ticket.id}`
  }

  public getFreight(): number {
    return this.freight.amount * this.ticket.net.getMassInUnit(this.freight.unit);
  }

  public getDiscountedFreight(): number {
    return this.getFreight() - (this.ticket.net.subtract(this.ticket.original_weight).getMassInUnit(this.freight.unit) - this.ticket.net.getMassInUnit(this.freight.unit) * this.tolerance / 100) * this.contract.price.getPricePerUnit(this.freight.unit, this.contract.quantity) * this.exchangeRate;
  }
}