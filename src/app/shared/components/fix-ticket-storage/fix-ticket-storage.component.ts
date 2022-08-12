import { Component, Input, OnInit } from '@angular/core';
import { Plant } from '@shared/classes/plant';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-fix-ticket-storage',
  templateUrl: './fix-ticket-storage.component.html',
  styleUrls: ['./fix-ticket-storage.component.scss'],
})
export class FixTicketStorageComponent implements OnInit {
  @Input() ticket: Ticket;
  public plant: Plant;

  constructor(
  ) { }

  ngOnInit() {
    this.ticket.getPlant().then(plant => {
      this.plant = plant;
    });
  }

}
