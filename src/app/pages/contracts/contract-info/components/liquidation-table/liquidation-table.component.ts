import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Contract } from '@shared/classes/contract';
import { Liquidation, LiquidationTotals, TicketInfo } from '@shared/classes/liquidation';
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
    private dialog: MatDialog
  ) { }

  ngOnInit() {}

  public async remove(index: number) {
    if (await this.confirm.openDialog("delete this liquidation")) {
      const liquidation = this.liquidations.splice(index, 1)[0];
      liquidation.delete();
    }
  }

  public archive(index: number) {
    console.log("archive")
  }

  public async cancel(index: number) {
    if (await this.confirm.openDialog("cancel this liquidation?")) {
      const liquidation = this.liquidations[index];

      liquidation.update({ status: "cancelled" })
      .then(() => {
        liquidation.status = "cancelled";
        this.snack.open("Liquidation Cancelled");
      }).catch(e => {
        console.error(e);
        this.snack.open("Error: Liquidation not Cancelled", "error");
      });
    }
  }

  public openLiquidation(liquidation: Liquidation) {
    const dialog = this.dialog.open(LiquidationDialogComponent, {
      data: {
        selectedTickets: liquidation.tickets,
        contract: this.contract,
        totals: new LiquidationTotals(liquidation.tickets, this.contract),
      },
      panelClass: "borderless-dialog",
      minWidth: "80%",
      maxWidth: "100%",
      height: "75vh"
    });
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
