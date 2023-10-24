import { Component, Input, OnInit } from '@angular/core';
import { Payment } from '@shared/classes/payment';

type TableDataType = "num" | "button" | "text";

type TableField = {
  key: string
  header: string,
  dataType?: TableDataType,
  icon?: string,
  action?: (params?: any) => any
}

@Component({
  selector: 'app-payments-table',
  templateUrl: './payments-table.component.html',
  styleUrls: ['./payments-table.component.scss'],
})
export class PaymentsTableComponent implements OnInit {
  @Input() payments: Payment[];

  public testData = [
    {
      type: "prepay",
      amount: 500,
      liquidation: 23,
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: 23,
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: 23,
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: 23,
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: 23,
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: 23,
      proofOfPaymentDocs: []
    },
  ];

  public arrayTableFields: TableField[] = [
    {
      key: "liquidation",
      header: "Liquidation"
    },
    {
      key: "type",
      header: "Type"
    },
    {
      key: "amount",
      header: "Amount",
      dataType: "num"
    },
    {
      key: "proofOfPaymentDocs",
      header: "Proof of Payment",
      dataType: "button",
      icon: "cloud_upload",
      
    }
  ];

  constructor() {}

  ngOnInit() {
    console.log(this.payments)
  }
}
