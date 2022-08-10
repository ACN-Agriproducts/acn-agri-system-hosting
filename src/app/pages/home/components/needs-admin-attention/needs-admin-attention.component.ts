import { Component, Input, OnInit } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Plant } from '@shared/classes/plant';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-needs-admin-attention',
  templateUrl: './needs-admin-attention.component.html',
  styleUrls: ['./needs-admin-attention.component.scss'],
})
export class NeedsAdminAttentionComponent implements OnInit {
  @Input() company: string;
  public ticketsList: Ticket[];

  constructor(
    private db: Firestore,
    private localStorage: Storage
  ) { }

  ngOnInit() {
    this.ticketsList = [];

    Plant.getPlantList(this.db, this.company).then(plants => {
      plants.forEach(plant => {
        Ticket.getTickets(this.db, this.company, plant.ref.id, where('voidRequest', '==', true)).then(tickets => {
          this.ticketsList.push(...tickets);
        }); 
      });
    });
  }

}
