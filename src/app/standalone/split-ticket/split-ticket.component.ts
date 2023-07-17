import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { doc, DocumentReference, Firestore, where, writeBatch } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreModule } from '@core/core.module';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { IonicModule } from '@ionic/angular';
import { Contract } from '@shared/classes/contract';
import { Mass, units } from '@shared/classes/mass';
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
  public contract: Contract;
  public possibleContracts: Promise<Contract[]>;
  public newTickets: SplitTicket[] = [];
  public numberOfTickets: number = 2;
  public newContracts: splitContract[] = [];

  public displayUnit: units;
  public defaultUnit: units;
  public language: string;
  public 

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Ticket,
    private db: Firestore,
    private session: SessionInfo,
  ) { }

  ngOnInit() {
    this.displayUnit = this.session.getDisplayUnit();
    this.defaultUnit = this.session.getDefaultUnit();

    this.language = this.session.getLanguage();
    this.possibleContracts = this.data.getContract(this.db).then(ticketContract => {
      this.contract = ticketContract
      this.newTickets = [ this.newSplitTicket(), this.newSplitTicket() ];
      this.newTickets[0].net = this.data.net.getMassInUnit(this.defaultUnit);
      
      const contractOverdelivery = Math.round(this.contract.currentDelivered.getMassInUnit(this.defaultUnit));
      if(contractOverdelivery > 0 && contractOverdelivery - this.data.net.getMassInUnit(this.defaultUnit) < 0) {
        this.newTickets[0].net -= contractOverdelivery;
        this.newTickets[1].net = contractOverdelivery;
      }

      return Contract.getContracts(
        this.db, 
        this.session.getCompany(), 
        ticketContract.type,
        where('client', '==', ticketContract.client),
        where('status', '==', 'active'));
    });

    this.possibleContracts.then(() => {
      this.ticketContractChange();
    });
  }

  newSplitTicket(): SplitTicket {
    return {
      net: 0,
      contractId: this.contract.ref.id,
      lot: this.data.lot
    };
  }

  addTicket(): void {
    this.newTickets.push(this.newSplitTicket());
  }

  getSubIdChar(index: number): string {
    return String.fromCharCode(65 + index);
  }

  ticketWeightChange(): void {
    this.newTickets[0].net = this.data.net.getMassInUnit(this.defaultUnit);
    
    for(let index = 1; index < this.newTickets.length; index++) {
      this.newTickets[0].net -= this.newTickets[index].net;
    }

    const originalContract = this.newContracts.find(c => c.docId == this.contract.ref.id);
    this.newContracts.forEach(c => c.afterCurrent.amount = c.current.amount);

    this.newTickets.forEach(ticket => {
      const c = this.newContracts.find(c => c.docId == ticket.contractId);
      originalContract.afterCurrent.amount -= ticket.net;
      c.afterCurrent.amount += ticket.net;
    });
  }

  async ticketContractChange(): Promise<void> {
    const contracts: splitContract[] = [];
    const pContracts = await this.possibleContracts;
    this.newTickets.forEach(ticket => {
      if(contracts.some(c => c.docId == ticket.contractId)) return;
      const tContract = pContracts.find(c => c.ref.id == ticket.contractId);

      contracts.push({
        docId: ticket.contractId,
        id: tContract.id,
        current: new Mass(tContract.currentDelivered.getMassInUnit(this.defaultUnit), this.defaultUnit, tContract.productInfo),
        quantity: new Mass(tContract.quantity.getMassInUnit(this.defaultUnit), this.defaultUnit, tContract.productInfo),
        afterCurrent: new Mass(tContract.currentDelivered.getMassInUnit(this.defaultUnit), this.defaultUnit, tContract.productInfo),
      });
    });

    this.newContracts = contracts;
    this.ticketWeightChange()
  }

  removeTicket(index: number): void {
    this.newTickets.splice(index, 1);
    this.ticketContractChange();
  }

  async submit() {
    console.log(this.newTickets);
    // const batch = writeBatch(this.db);
    // const ticketCol = this.data.ref.parent.withConverter(null);

    // const ticketRefA = doc(ticketCol)
    // const ticketRefB = doc(ticketCol)
    // const ticketDataA = this.data.getGenericCopy();
    // const ticketDataB = this.data.getGenericCopy();

    // ticketDataA.gross -= this.newWeight.getMassInUnit(this.session.getDefaultUnit());
    // ticketDataA.splitTicketSibling = ticketRefB;
    // ticketDataA.splitTicketParent = this.data.ref;
    // ticketDataA.subId = 'A';

    // ticketDataB.gross = this.newWeight.getMassInUnit(this.session.getDefaultUnit()) + ticketDataB.tare;
    // ticketDataB.contractRef = this.newContract.ref;
    // ticketDataB.contractID = this.newContract.id;
    // ticketDataB.splitTicketSibling = ticketRefA;
    // ticketDataB.splitTicketParent = this.data.ref;
    // ticketDataB.subId = 'B';

    // console.log(ticketDataA);
    // console.log(ticketDataB);

    // batch.update(this.data.ref.withConverter(null), {
    //   splitTicketChildA: ticketRefA,
    //   splitTicketChildB: ticketRefB,
    //   void: true,
    //   voidAcceptor: 'System',
    //   voidReason: 'Split Ticket',
    //   voidRequester: this.session.getUser().uid
    // });

    // console.log("setting")
    // batch.set(ticketRefA, ticketDataA);
    // batch.set(ticketRefB, ticketDataB);

    // console.log(batch, 'set');
    // batch.commit();
  }
}

interface SplitTicket {
  net: number;
  contractId: string;
  lot: string;
}

interface splitContract {
  docId: string;
  id: number;
  current: Mass;
  quantity: Mass;
  afterCurrent: Mass;
}