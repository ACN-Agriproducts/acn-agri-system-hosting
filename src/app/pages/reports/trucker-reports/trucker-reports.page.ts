import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Storage } from '@ionic/storage';
import { Plant } from '@shared/classes/plant';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-trucker-reports',
  templateUrl: './trucker-reports.page.html',
  styleUrls: ['./trucker-reports.page.scss'],
})
export class TruckerReportsPage implements OnInit {
  public plantList: Plant[];
  public chosenPlants: Plant[];
  public startDate: Date;
  public endDate: Date;

  public truckerList: truckerTickets[];
  public checkedTruckers: truckerTickets[] = [];

  constructor(
    private db: AngularFirestore,
    private localStorage: Storage,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.localStorage.get('currentCompany').then(companyName => {
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

    const _truckerList: truckerTickets[] = [];

    ticketList.forEach(ticket => {
      let trucker = _truckerList.find(t => t.name == ticket.driver.toUpperCase().replace(/\s*\d*\s*$/, '').replace(/\s{2,}/, ' '));
      
      if(trucker) {
        trucker.addTicket(ticket);
      }
      else {
        trucker = new truckerTickets(ticket.driver.toUpperCase().replace(/\s*\d*\s*$/, '').replace(/\s{2,}/, ' '));
        trucker.addTicket(ticket);
        _truckerList.push(trucker);
      }
    });

    _truckerList.sort((a, b) => {
      if(a.name < b.name) return -1;
      if(a.name > b.name) return 1;
      return 0;
    });

    this.truckerList = _truckerList;
  }

  public truckerCheckChange(event: any, trucker: truckerTickets): void {
    if(event.checked) {
      this.checkedTruckers.push(trucker);
    }
    else {
      this.checkedTruckers = this.checkedTruckers.filter(t => t.name != trucker.name);
    }

    console.log(this.checkedTruckers);
  }

  public mergeTruckers(): void {
    this.dialog.open(DialogChooseName, {
      data: this.checkedTruckers
    }).afterClosed().toPromise().then((name: string) => {
      if(!name) {
        return;
      }

      const tempTruckerList = this.truckerList.filter(t => !this.checkedTruckers.some(trucker => trucker.name == t.name));
      tempTruckerList.push(truckerTickets.merge(name.toUpperCase().trim(), ...this.checkedTruckers));
      tempTruckerList.sort((a, b) => {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      });

      this.truckerList = tempTruckerList;
      this.checkedTruckers = [];
    });
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

class truckerTickets {
  public name: string;
  public tickets: Ticket[];
  public freight: number;
  public totalWeight: number;

  constructor(_name: string) {
    this.name = _name;
    this.tickets = [];
    this.totalWeight = 0;
    this.freight = 0;
  }

  addTicket(ticket: Ticket) {
    this.tickets.push(ticket);
    this.totalWeight += ticket.getNet();
  }

  static merge(name: string, ...truckers: truckerTickets[]): truckerTickets {
    const newTrucker = new truckerTickets(name);

    truckers.forEach(trucker => {
      newTrucker.tickets.push(...trucker.tickets);
      newTrucker.totalWeight += trucker.totalWeight;
    });

    return newTrucker;
  }
}