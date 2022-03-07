import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Storage } from '@ionic/storage';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Plant } from '@shared/classes/plant';
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

  public transportList: transportGroup[];
  public printableTicketsDone: number = 0;
  public ticketsBoxChecked: boolean = false;

  constructor(
    private db: AngularFirestore,
    private localStorage: Storage,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.localStorage.get('currentCompany').then(companyName => {
      this.currentCompany = companyName;
      Plant.getCollectionReference(this.db, companyName).get().then(result => {
        const tempPlantList: Plant[] = [];

        result.forEach(snap => {
          tempPlantList.push(snap.data());
        });

        this.plantList = tempPlantList;
        this.chosenPlants = tempPlantList;
      });
    });
  }

  public async getTickets(): Promise<void> {
    const ticketList: Ticket[] = [];
    const promises: Promise<any>[] = [];
    this.endDate.setHours(23, 59, 59, 999);

    this.chosenPlants.forEach(plant => {
      const promise = plant.getTicketCollectionReference()
        .where('dateOut', '>=', this.startDate)
        .where('dateOut', '<=', this.endDate).get().then(result =>{ 
        result.forEach(snap => {
          const ticket = snap.data();
          if(ticket.void) {
            return;
          }

          ticketList.push(ticket);
        });
      });

      promises.push(promise);
    });

    await Promise.all(promises);

    const tempTransportList: transportGroup[] = [];

    ticketList.forEach(ticket => {
      let transport = tempTransportList.find(t => t.id == ticket.truckerId);

      if(transport == null){ 
        transport = new transportGroup(ticket.truckerId, this.currentCompany, this.db);
        tempTransportList.push(transport);
      }

      let trucker = transport.getDriver(ticket.driver);

      if(trucker == null) {
        trucker = transport.addDriver(ticket.driver);
      }

      trucker.addTicket(ticket);  
    });

    tempTransportList.forEach(transport => {
      transport.drivers.sort((a, b) => {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      });
    });

    this.transportList = tempTransportList;
  }

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
          this.printableTicketsDone++;
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

  constructor(_id: string, company: string, db: AngularFirestore) {
    this.id = _id;
    this.drivers = [];

    Contact.getDoc(db, company, _id).then(result => {
      this.transport = result;
    });
  }

  public addTicket(ticket: Ticket): void {
    const driverName = ticket.driver.toUpperCase().replace(/\s*\d*\s*$/, '').replace(/\s{2,}/, ' ');
    let driver = this.drivers.find(t => t.name == driverName);
    
    if(driver == null) {
      driver = this.addDriver(driverName);
    }

    driver.addTicket(ticket);
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
    this.checked = false;
  }

  addTicket(ticket: Ticket) {
    this.tickets.push(new ticketCheck(ticket));
  }

  public getPrintableTicketInfo(db: AngularFirestore): Promise<void> {
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
        total += ticket.ticket.getNet();
      }
    })

    return total;
  }

  public getFreightTotal(): number {
    let total: number = 0;

    this.tickets.forEach(ticket => {
      if(ticket.checked){
        total += ticket.getFreight();
      }
    })

    return total;
  }

  public getTicketAmount(): number {
    return this.tickets.length;
  }

  static merge(name: string, ...truckers: truckerTickets[]): truckerTickets {
    const newTrucker = new truckerTickets(name);
    newTrucker.checked = true;

    truckers.forEach(trucker => {
      newTrucker.tickets.push(...trucker.tickets);
    });

    return newTrucker;
  }
}

class ticketCheck {
  public ticket: Ticket;
  public checked: boolean;
  public freight: number;

  constructor(_ticket: Ticket) {
    this.ticket = _ticket;
    this.freight = 0;
  }

  public getDescription(): string {
    return `${this.ticket.in? 'IN' : 'OUT'} TICKET ${this.ticket.id}`
  }

  public getFreight(): number {
    return this.freight * this.ticket.getNet() / 100;
  }
}