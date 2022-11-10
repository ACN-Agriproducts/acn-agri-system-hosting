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

  public getDate(): Date {
    return new Date();
  }

  public getTable(): HTMLElement{ 
    return document.getElementById("liquidation-table");
  }

  public getTotals() {
    console.log("Calculating Totals")
    this.gross = this.tare = this.moistureDiscount = this.moistureAdjustedWeight = this.totalTotal = this.infestedTotal = this.inspectionTotal = this.netToPayTotal = 0;

    console.log(this.ticketList)
    this.ticketList.forEach(ticket => {
      this.gross += ticket.data.gross;
      this.tare += ticket.data.tare;
      this.moistureDiscount += ticket.data.dryWeight - (ticket.data.gross - ticket.data.tare);
      this.moistureAdjustedWeight += ticket.data.dryWeight;

      this.totalTotal += this.contract.pricePerBushel * ticket.data.dryWeight / this.contract.productInfo.weight;
      this.infestedTotal += ticket.discounts.infested;
      this.inspectionTotal += ticket.discounts.inspection;
    });
    this.netToPayTotal = this.totalTotal - this.infestedTotal - this.inspectionTotal;
  }
}
