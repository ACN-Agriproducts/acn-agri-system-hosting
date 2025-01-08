import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreModule } from '@core/core.module';
import { Contact } from '@shared/classes/contact';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-ticket-dialog',
  templateUrl: './ticket-dialog.component.html',
  styleUrls: ['./ticket-dialog.component.scss'],
  standalone: true,
  imports: [
    CoreModule,
    SharedModule,
    CommonModule
  ]
})
export class TicketDialogComponent implements OnInit {
  public contract: Contract
  public transport: Contact
  public client: Contact

  constructor(
    public dialogRef: MatDialogRef<TicketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public ticket: Ticket,
    private db: Firestore
  ) { }

  ngOnInit() {
    this.ticket.getPrintDocs(this.db).then(result => {
      [,this.contract,this.client,this.transport] = result;
    });
  }

}
