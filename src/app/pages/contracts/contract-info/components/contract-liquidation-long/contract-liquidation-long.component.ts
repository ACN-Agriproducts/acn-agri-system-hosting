import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';

declare type TicketWithDiscount = { data: Ticket, discounts: any, includeInReport: boolean };

@Component({
  selector: 'app-contract-liquidation-long',
  templateUrl: './contract-liquidation-long.component.html',
  styleUrls: ['./contract-liquidation-long.component.scss'],
})
export class ContractLiquidationLongComponent implements OnInit {
  @Input() ticketList: TicketWithDiscount[];
  @Input() contract: Contract;

  public gross: number = 0;
  public tare: number = 0;
  public moistureDiscount: number = 0;
  public moistureAdjustedWeight: number = 0;
  public totalTotal: number = 0;
  public infestedTotal: number = 0;
  public inspectionTotal: number = 0;
  public netToPayTotal: number = 0;

  constructor() { }

  ngOnInit() {
    this.getTotals();
  }

  /* public getTotalInfestedDiscount(): number {
    let total = 0;

    this.ticketList.forEach(ticket => {
      total += ticket.discounts.infested;
    });

    return total;
  }

  public getTotalInspectionDiscount(): number {
    let total = 0;

    this.ticketList.forEach(ticket => {
      total += ticket.discounts.inspection;
    });

    return total;
  } */

  public getDate(): Date {
    return new Date();
  }

  public getTable(): HTMLElement{ 
    return document.getElementById("liquidation-table");
  }

  public getTotals() {
    this.ticketList.forEach(ticket => {
      this.gross += ticket.data.gross;
      this.tare += ticket.data.tare;
      this.moistureDiscount += ticket.data.dryWeight - (ticket.data.gross - ticket.data.tare);
      this.moistureAdjustedWeight += ticket.data.dryWeight;

      this.infestedTotal += ticket.discounts.infested;
      this.inspectionTotal += ticket.discounts.inspection;
    });

    this.totalTotal = this.moistureAdjustedWeight / 100 * this.contract.pricePerBushel / 0.56;
    this.netToPayTotal = this.moistureAdjustedWeight / 100 * this.contract.pricePerBushel / 0.56;
  }
}
