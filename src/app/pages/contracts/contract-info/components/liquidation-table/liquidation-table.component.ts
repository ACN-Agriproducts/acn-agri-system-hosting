import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { updateDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { TranslocoService } from '@ngneat/transloco';
import { Contract } from '@shared/classes/contract';
import { Liquidation, LiquidationTotals, TicketInfo } from '@shared/classes/liquidation';
import { DocumentUploadDialogComponent, DialogUploadData } from '@shared/components/document-upload-dialog/document-upload-dialog.component';
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

  public permissions: any;

  constructor(
    private confirm: ConfirmationDialogService,
    private snack: SnackbarService,
    private dialog: MatDialog,
    private session: SessionInfo,
    private transloco: TranslocoService
  ) { }

  ngOnInit() {
    this.permissions = this.session.getPermissions();
  }

  public async remove(index: number) {
    if (await this.confirm.openDialog("delete this liquidation")) {
      const liquidation = this.liquidations.splice(index, 1)[0];
      liquidation.delete();
    }
  }

  public archive(liquidation: Liquidation) {
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

  public async uploadDocuments(liquidation: Liquidation) {
    const docType = this.transloco.translate("contracts.info.Supplemental");

    let locationRef = `/companies/${this.session.getCompany()}/contracts/${this.contract.id}/liquidations/${liquidation.ref.id}`;
    locationRef += `/${docType.toLocaleLowerCase().replace(/\s+/g, "-")}`;
      
    const files = liquidation.supplementalDocs.map(doc => 
      ({ ...doc, url: null, dropfile: null, contentType: null })
    );
    const uploadable = liquidation.status !== 'cancelled';

    const dialogData: DialogUploadData = {
      docType,
      locationRef,
      files,
      uploadable
    };

    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      data: dialogData,
      autoFocus: false
    });
    const updateData = await lastValueFrom(dialogRef.afterClosed());
    if (!updateData || !uploadable) return;
    
    updateDoc(liquidation.ref, {
      supplementalDocs: updateData
    })
    .then(() => {
      this.snack.open("Successfully updated Liquidation", "success");
    })
    .catch(e => {
      console.error(e);
      this.snack.open("Failed to update Liquidation", "error");
    });
  }

}

@Pipe({
  name: 'ticketIds'
})
export class TicketIdsPipe implements PipeTransform {

  transform(tickets: TicketInfo[], ...args: any[]): number[] {
    return tickets.map(ticket => ticket.id);
  }
 
}
