import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
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

  constructor(
    private db: AngularFirestore,
    private localStorage: Storage
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
      const promise = plant.getTicketCollectionReference().where('dateOut', '>=', this.startDate).where('dateOut', '<=', this.endDate).get().then(result =>{ 
        result.forEach(snap => {
          ticketList.push(snap.data());
        });
      });

      promises.push(promise);
    });

    await Promise.all(promises);

    const _truckerList: truckerTickets[] = [];

    ticketList.forEach(ticket => {
      let trucker = _truckerList.find(t => t.name == ticket.driver);
      
      if(trucker) {
        trucker.addTicket(ticket);
      }
      else {
        trucker = new truckerTickets(ticket.driver);
        trucker.addTicket(ticket);
        _truckerList.push(trucker);
      }
    });

    this.truckerList = _truckerList;
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