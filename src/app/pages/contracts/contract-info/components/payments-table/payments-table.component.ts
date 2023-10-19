import { Component, OnInit } from '@angular/core';

declare type PaymentType = "pre-paid" | "post-paid";
declare type TableDataType = "numerical" | "button" | "text";

interface TableField {
  header: string,
  dataType?: string,
  icon?: string,
}

type TableFields = {
  [key: string]: {
    header: string,
    dataType?: string,
    icon?: string
  }
}

@Component({
  selector: 'app-payments-table',
  templateUrl: './payments-table.component.html',
  styleUrls: ['./payments-table.component.scss'],
})
export class PaymentsTableComponent implements OnInit {

  public testData = [
    {
      type: "pre-paid",
      amount: 500,
      liquidation: 23,
      proofOfPaymentDocs: []
    },
    {
      type: "pre-paid",
      amount: 500,
      liquidation: 23,
      proofOfPaymentDocs: []
    },
    {
      type: "pre-paid",
      amount: 500,
      liquidation: 23,
      proofOfPaymentDocs: []
    },
    {
      type: "pre-paid",
      amount: 500,
      liquidation: 23,
      proofOfPaymentDocs: []
    },
    {
      type: "pre-paid",
      amount: 500,
      liquidation: 23,
      proofOfPaymentDocs: []
    },
    {
      type: "pre-paid",
      amount: 500,
      liquidation: 23,
      proofOfPayment: []
    },
  ];

  constructor() { }

  ngOnInit() {}

}
