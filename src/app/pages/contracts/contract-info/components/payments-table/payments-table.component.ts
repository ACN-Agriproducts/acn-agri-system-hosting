import { Component, Input, OnInit } from '@angular/core';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Payment } from '@shared/classes/payment';

// TYPES THAT REUSABLE TABLE WOULD USE
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

  public permissions: any;
  public paymentsTableFields: TableField[] = [
    {
      key: "paidDocumentRefs",
      header: "Liquidation(s)",
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

  // PROPERTIES FOR SIMULATING A REUSABLE TABLE
  public data: any[];
  public tableFields: TableField[];
  
  constructor(
    private session: SessionInfo
  ) {}

  ngOnInit() {
    this.tableFields = this.paymentsTableFields;
    this.permissions = this.session.getPermissions();
  }

  ngOnChanges() {
    this.data = this.payments;
  }

  test(items?, index?) {
    console.log("TEST")
    if (items && index != null) console.log(items, index)
  }
}
