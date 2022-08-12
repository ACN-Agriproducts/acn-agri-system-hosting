import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-fix-ticket-storage',
  templateUrl: './fix-ticket-storage.component.html',
  styleUrls: ['./fix-ticket-storage.component.scss'],
})
export class FixTicketStorageComponent implements OnInit {
  @Input() ticket: Ticket;

  constructor(
    private firebase: Firestore
  ) { }

  ngOnInit() {}

}
