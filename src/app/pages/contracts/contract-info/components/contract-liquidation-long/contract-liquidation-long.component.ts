import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-contract-liquidation-long',
  templateUrl: './contract-liquidation-long.component.html',
  styleUrls: ['./contract-liquidation-long.component.scss'],
})
export class ContractLiquidationLongComponent implements OnInit {
  @Input() ticketList: {data: Ticket, discounts: any}[];
  @Input() contract: Contract;

  public gross: number = 0;
  public tare: number = 0;
  public moistureDiscount: number = 0;
  public moistureAdjustedWeight: number = 0;
  public infestedTotal: number = 0;
  public inspectionTotal: number = 0;
  public netToPayTotal: number = 0;

  constructor() { }

  ngOnInit() {
    this.ticketList.forEach(ticket => {
      this.gross += ticket.discounts.gross;
      this.tare += ticket.discounts.tare;
      this.moistureDiscount += ticket.discounts.dryWeight - (ticket.discounts.gross - ticket.discounts.tare);
      this.moistureAdjustedWeight += ticket.discounts.dryWeight;
    });
  }

  public getDate(): Date {
    return new Date();
  }
}
