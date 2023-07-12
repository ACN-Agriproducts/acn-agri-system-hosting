import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreModule } from '@core/core.module';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { IonicModule } from '@ionic/angular';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-split-ticket',
  templateUrl: './split-ticket.component.html',
  styleUrls: ['./split-ticket.component.scss'],
  standalone: true,
  imports: [
    CoreModule,
    CommonModule,
    IonicModule,
    FormsModule,
  ]
})
export class SplitTicketComponent implements OnInit {
  public contract: Promise<Contract>;
  public possibleContracts: Promise<Contract[]>;
  public newContract: Contract;
  public newWeight: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Ticket,
    private db: Firestore,
    private session: SessionInfo,
  ) { }

  ngOnInit() {
    this.contract = this.data.getContract(this.db);
    this.possibleContracts = this.contract.then(ticketContract => {
      return Contract.getContracts(
        this.db, 
        this.session.getCompany(), 
        ticketContract.type,
        where('client', '==', ticketContract.client),
        where('status', '==', 'active'));
    });

    this.possibleContracts.then(async contractsList => {
      const ticketContract = await this.contract;
      this.newContract = contractsList.find(c => c.ref.id == ticketContract.ref.id) ?? null;
      if(!this.newContract) return;

      const contractOverdelivery = this.newContract.currentDelivered.subtract(this.newContract.quantity)
      if(contractOverdelivery.get() > 0 && contractOverdelivery.subtract(this.data.getNet()).get() < 0) {
        this.newWeight = Math.round(contractOverdelivery.getMassInUnit('lbs'));
      }
    });
  }

  test() {
    console.log(this.newContract, this.newWeight);
  }

}
