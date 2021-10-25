import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-contract-liquidation-long',
  templateUrl: './contract-liquidation-long.component.html',
  styleUrls: ['./contract-liquidation-long.component.scss'],
})
export class ContractLiquidationLongComponent implements OnInit {
  public ticketList: any[];
  @Input() contract: any;

  public gross: number = 0;
  public tare: number = 0;
  public moistureDiscount: number = 0;
  public moistureAdjustedWeight: number = 0;
  public infestedTotal: number = 0;
  public inspectionTotal: number = 0;
  public netToPayTotal: number = 0;

  constructor() { }

  ngOnInit() {}

  public setTickets(tempList: any[]): void {
    this.ticketList = tempList;

    this.ticketList.forEach(ticket => {
      this.gross += ticket.gross;
      this.tare += ticket.tare;
      this.moistureDiscount += ticket.dryWeight - (ticket.gross - ticket.tare);
      this.moistureAdjustedWeight += ticket.dryWeight;
    });
  }

  public getDate(): Date {
    return new Date();
  }
}
