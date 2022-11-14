import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { Ticket } from '@shared/classes/ticket';

@Component({
  selector: 'app-contract-liquidation-long',
  templateUrl: './contract-liquidation-long.component.html',
  styleUrls: ['./contract-liquidation-long.component.scss'],
})
export class ContractLiquidationLongComponent implements OnInit {
  @Input() contract: Contract;
  @Input() ticketList: { 
    data: Ticket, 
    discounts: any, 
    includeInReport: boolean 
  }[];
  @Input() totals: {
    gross: number,
    tare: number,
    net: number,
    moistureDiscount: number,
    moistureAdjustedWeight: number,
    finalTotal: number,
    infestedTotal: number,
    inspectionTotal: number,
    netToPayTotal: number
  };

  constructor() { }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

  public getDate(): Date {
    return new Date();
  }

  public getTable(): HTMLElement{ 
    return document.getElementById("liquidation-table");
  }
}
