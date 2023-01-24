import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-delivered-chart-card',
  templateUrl: './delivered-chart-card.component.html',
  styleUrls: ['./delivered-chart-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveredChartCardComponent implements OnInit {
  @Input() contract: Contract;
  ticketList: Ticket[];

  constructor() { }

  ngOnInit() {
    this.contract.getTickets().then(result => {
      this.ticketList = result;
    });
  }
}
