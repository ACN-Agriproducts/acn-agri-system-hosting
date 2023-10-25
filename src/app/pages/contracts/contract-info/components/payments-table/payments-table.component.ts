import { Component, Input, OnInit } from '@angular/core';
import { Payment } from '@shared/classes/payment';

type TableDataType = "num" | "button" | "text" | "text-translate";

type TableField = {
  key: string
  header: string,
  dataType?: TableDataType,
  icon?: string,
  action?: (...params: any) => any
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
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
    {
      type: "prepay",
      amount: 500,
      liquidation: [23].toString(),
      proofOfPaymentDocs: []
    },
  ];

  public arrayTableFields: TableField[] = [
    {
      key: "liquidation",
      header: "Liquidation(s)",
      dataType: "text"
    },
    {
      key: "type",
      header: "Type",
      dataType: "text-translate"
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
      action: this.test
    }
  ];

  constructor() {}

  ngOnInit() {
    console.log(this.payments)
  }

  test(items?, index?) {
    console.log("TEST")

    if (items && index != null) console.log(items, index)
  }
}
