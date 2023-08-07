import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { getDoc } from '@angular/fire/firestore';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Liquidation } from '@shared/classes/liquidation';
import { Ticket } from '@shared/classes/ticket';
import { DocumentReference } from 'firebase/firestore';

@Component({
  selector: 'app-liquidation-table',
  templateUrl: './liquidation-table.component.html',
  styleUrls: ['./liquidation-table.component.scss'],
})
export class LiquidationTableComponent implements OnInit {
  @Input() liquidations: Liquidation[];

  constructor(
    private confirm: ConfirmationDialogService,
    private snack: SnackbarService,
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

}

@Pipe({
  name: 'ticketIds'
})
export class TicketIdsPipe implements PipeTransform {
  
  transform(ticketRefs: DocumentReference<Ticket>[], ...args: any[]): Promise<number>[] {
    return ticketRefs.map(async ref => (await getDoc(ref)).data().id)
  }
 
}
