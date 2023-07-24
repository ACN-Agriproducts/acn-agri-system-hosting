import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { documentId, Firestore, where } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreModule } from '@core/core.module';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { IonicModule } from '@ionic/angular';
import { Contract } from '@shared/classes/contract';
import { units } from '@shared/classes/mass';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-change-ticket-contract',
  templateUrl: './change-ticket-contract.component.html',
  styleUrls: ['./change-ticket-contract.component.scss'],
  standalone: true,
  imports: [
    CoreModule,
    CommonModule,
    IonicModule,
    FormsModule,
  ]
})
export class ChangeTicketContractComponent implements OnInit {
  public contract: Contract;
  public possibleContracts: Promise<Contract[]>;
  public newContract: Contract;
  public displayUnit: units;
  public language: string;
  public submitting: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Ticket,
    public dialogRef: MatDialogRef<ChangeTicketContractComponent>,
    private db: Firestore,
    private session: SessionInfo,
    private snack: SnackbarService
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.possibleContracts = this.data.getContract(this.db).then(ticketContract => {
      this.contract = ticketContract;
      this.data.net.defineBushels(ticketContract.productInfo);
      return Contract.getContracts(
        this.db, this.session.getCompany(), ticketContract.type,
        where('client', '==', ticketContract.client),
        where('status', '==', 'active'),
        where('product', '==', ticketContract.product),
        where(documentId(), "!=", ticketContract.ref.id));
    });

    this.displayUnit = this.session.getDisplayUnit();
    this.language = this.session.getLanguage();
  }

  submit(): void {

  }
}
