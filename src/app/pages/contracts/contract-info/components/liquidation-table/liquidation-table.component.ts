import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { TranslocoService } from '@ngneat/transloco';
import { Contract } from '@shared/classes/contract';
import { Liquidation, LiquidationTotals, TicketInfo } from '@shared/classes/liquidation';
import { DocumentUploadDialogComponent, DialogUploadData } from '@shared/components/document-upload-dialog/document-upload-dialog.component';
import { UploadDialogData, UploadDocumentDialogComponent } from '@shared/components/upload-document-dialog/upload-document-dialog.component';
import { lastValueFrom } from 'rxjs';
import { LiquidationDialogComponent } from 'src/app/modules/liquidation-printables/liquidation-dialog/liquidation-dialog.component';

@Component({
  selector: 'app-liquidation-table',
  templateUrl: './liquidation-table.component.html',
  styleUrls: ['./liquidation-table.component.scss'],
})
export class LiquidationTableComponent implements OnInit {
  @Input() liquidations: Liquidation[];
  @Input() contract: Contract;

  constructor(
    private confirm: ConfirmationDialogService,
    private snack: SnackbarService,
    private dialog: MatDialog,
    private session: SessionInfo,
    private transloco: TranslocoService
  ) { }

  ngOnInit() {}

  public async remove(index: number) {
    if (await this.confirm.openDialog("delete this liquidation")) {
      const liquidation = this.liquidations.splice(index, 1)[0];
      liquidation.delete();
    }
  }

  public archive(liquidation: Liquidation) {
    // CHECK IF THEY CAN ONLY ARCHIVE WHEN THE LIQUIDATION IS CANCELLED OR PAID
    console.log("archive")
    liquidation.archived = true;
  }

  public async cancel(liquidation: Liquidation) {
    if (!await this.confirm.openDialog("cancel this liquidation?")) return;

    liquidation.update({ status: "cancelled" })
    .then(() => {
      liquidation.status = "cancelled";
      this.snack.open("Liquidation Cancelled");
    }).catch(e => {
      console.error(e);
      this.snack.open("Error: Liquidation not Cancelled", "error");
    });
  }

  public openLiquidation(liquidation: Liquidation) {
    const dialog = this.dialog.open(LiquidationDialogComponent, {
      data: {
        selectedTickets: liquidation.tickets,
        contract: this.contract,
        totals: new LiquidationTotals(liquidation.tickets, this.contract),
        cancelled: liquidation.status === 'cancelled'
      },
      panelClass: "borderless-dialog",
      minWidth: "80%",
      maxWidth: "100%",
      height: "75vh"
    });
  }

  public async uploadDocuments(liquidation: Liquidation, isProof: boolean) {
    let locationRef = `/companies/${this.session.getCompany()}/contracts/${this.contract.id}/liquidations/${liquidation.date.toLocaleDateString().replace(/\/+/g, "-")}_`;
    const docs = (isProof ? liquidation.proofOfPaymentDocs : liquidation.supplementalDocs).map(doc => ({ ...doc, dropFile: null }));

    const dialogData: DialogUploadData = {
      docType: isProof ? this.transloco.translate("contracts.info.Proof of Payment") : this.transloco.translate("contracts.info.Supplemental"),
      // files: isProof ? [...liquidation.proofOfPaymentDocs] : [...liquidation.supplementalDocs],
      files: docs,
      uploadable: liquidation.status !== 'cancelled',
      locationRef
    };

    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      data: dialogData,
      autoFocus: false
    });
    const updateData = await lastValueFrom(dialogRef.afterClosed());
    console.log(updateData)
    if (!updateData) return;
    
    console.log("UPDATE LIQUIDATION WITH NEW DOCUMENTS")
  }

}

@Pipe({
  name: 'ticketIds'
})
export class TicketIdsPipe implements PipeTransform {
  
  // transform(ticketRefs: DocumentReference<Ticket>[], ...args: any[]): Promise<number>[] {
  //   return ticketRefs.map(async ref => (await getDoc(ref)).data().id)
  // }

  transform(tickets: TicketInfo[], ...args: any[]): number[] {
    return tickets.map(ticket => ticket.id);
  }
 
}
