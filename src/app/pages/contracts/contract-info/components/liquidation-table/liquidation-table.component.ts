import { Component, Input, OnInit, Pipe, PipeTransform } from '@angular/core';
import { getDoc } from '@angular/fire/firestore';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
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
  ) { }

  ngOnInit() {}

  async deleteLiquidation(index: number) {
    if (await this.confirm.openDialog("delete this liquidation")) {
      const liquidation = this.liquidations.splice(index, 1)[0];
      liquidation.delete();
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
