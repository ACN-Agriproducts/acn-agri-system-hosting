import { Component, OnInit } from '@angular/core';

type TableDataType = "num" | "button" | "text";

type TableField = {
  key: string
  header: string,
  dataType?: TableDataType,
  icon?: string
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
      icon: "cloud_upload"
    }
  ];

  constructor() { }

  ngOnInit() {}

}
