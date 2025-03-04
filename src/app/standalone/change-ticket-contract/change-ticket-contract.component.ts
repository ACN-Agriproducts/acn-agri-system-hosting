import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { arrayRemove, arrayUnion, documentId, Firestore, increment, where, writeBatch } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
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
  public possibleContracts: Promise<{ client: Contract[], other: Contract[] }>;
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
        where('status', '==', 'active'),
        where('product', '==', ticketContract.product),
        where(documentId(), "!=", ticketContract.ref.id));
    })
    .then(possibleContracts => {
      const clientContracts = [];
      const otherContracts = [];

      for (const contract of possibleContracts) {
        if (contract.client.id == this.contract.client.id) clientContracts.push(contract);
        else otherContracts.push(contract);
      }

      return {
        client: clientContracts,
        other: otherContracts
      }
    });

    this.displayUnit = this.session.getDisplayUnit();
    this.language = this.session.getLanguage() === 'es' ? 'es-MX' : 'en-US';
  }

  async submit(): Promise<void> {
    this.submitting = true;
    const defaultUnits = this.session.getDefaultUnit();

    const batch = writeBatch(this.db)
    try {
      batch.update(this.data.ref.withConverter(null), {
        contractID: this.newContract.id,
        contractRef: this.newContract.ref
      });
  
      console.log(this.data.net.getMassInUnit(defaultUnits));
  
      batch.update(this.contract.ref.withConverter(null), {
        currentDelivered: increment(-this.data.net.getMassInUnit(defaultUnits)),
        loads: increment(-1),
        tickets: arrayRemove(this.data.ref)
      });
  
      batch.update(this.newContract.ref.withConverter(null), {
        currentDelivered: increment(this.data.net.getMassInUnit(defaultUnits)),
        loads: increment(1),
        tickets: arrayUnion(this.data.ref)
      });
  
      await batch.commit();

      this.snack.openTranslated("Ticket contract changed", "success");
      this.dialogRef.close();
    } 
    catch (e) {
      console.error(e);
      this.snack.openTranslated("Error while changing the ticket contract.", 'error');
      this.submitting = false;
    }
  }
}
