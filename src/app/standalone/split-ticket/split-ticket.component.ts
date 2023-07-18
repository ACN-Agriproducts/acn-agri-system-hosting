import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { doc, DocumentReference, Firestore, where, writeBatch } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreModule } from '@core/core.module';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
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
  public newContracts: splitContract[] = []; // Object to display contract changes

  public displayUnit: units;
  public defaultUnit: units;
  public language: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Ticket,
    public dialogRef: MatDialogRef<SplitTicketComponent>,
    private db: Firestore,
    private session: SessionInfo,
    private functions: Functions,
    private snack: SnackbarService
  ) { }

  ngOnInit() {
    this.displayUnit = this.session.getDisplayUnit();
    this.defaultUnit = this.session.getDefaultUnit();
    this.language = this.session.getLanguage();

    // Get current ticket contract
    this.possibleContracts = this.data.getContract(this.db).then(ticketContract => {
      this.contract = ticketContract
      this.newTickets = [ this.newSplitTicket(), this.newSplitTicket() ];
      this.newTickets[0].net = this.data.net.getMassInUnit(this.defaultUnit);
      
      // Check if ticket can be split so that exess goes into the new contract
      const contractOverdelivery = Math.round(this.contract.currentDelivered.getMassInUnit(this.defaultUnit));
      if(contractOverdelivery > 0 && contractOverdelivery - this.data.net.getMassInUnit(this.defaultUnit) < 0) {
        this.newTickets[0].net -= contractOverdelivery;
        this.newTickets[1].net = contractOverdelivery;
      }

      // Get possible contracts ticket can be split into, contracts with the same client that are active
      return Contract.getContracts(
        this.db, 
        this.session.getCompany(), 
        ticketContract.type,
        where('client', '==', ticketContract.client),
        where('status', '==', 'active'));
    });

    // Set newContracts object
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
    
    // First ticket will always be calculated using the other tickets.
    for(let index = 1; index < this.newTickets.length; index++) {
      this.newTickets[0].net -= this.newTickets[index].net;
    }

    // Find and reset contracts
    const originalContract = this.newContracts.find(c => c.docId == this.contract.ref.id);
    this.newContracts.forEach(c => c.afterCurrent.amount = c.current.amount);

    // Calculate newContract objects
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
      // Check if contract is other than original
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

  formIsValid(): boolean {
    const initialValue = 0;
    return this.data.net.getMassInUnit(this.defaultUnit) == this.newTickets.map(t => t.net).reduce((prev, current) => prev + current, initialValue) && !this.newTickets.some(t => t.net < 0);
  }

  async submit() {
    httpsCallable(this.functions, 'tickets-splitTicket')({
      tickets: this.newTickets,
      ticketRef: this.data.ref.path,
    }).then(result => {
      console.log(result);
      this.snack.open("Successful", 'success');
      this.dialogRef.close();
    }).catch(e => {
      this.snack.open("Error", 'error');
      console.error(e)
    });
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