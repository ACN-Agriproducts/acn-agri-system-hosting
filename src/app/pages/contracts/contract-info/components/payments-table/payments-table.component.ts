import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Payment } from '@shared/classes/payment';
import { SetPaymentDialogComponent } from '../set-payment-dialog/set-payment-dialog.component';
import { Liquidation } from '@shared/classes/liquidation';
import { lastValueFrom } from 'rxjs';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { DialogUploadData, DocumentUploadDialogComponent } from '@shared/components/document-upload-dialog/document-upload-dialog.component';
import { updateDoc } from '@angular/fire/firestore';
import { TranslocoService } from '@ngneat/transloco';

// TYPES THAT REUSABLE TABLE WOULD USE
type TableDataType = "number" | "button" | "text" | "text-translate" | "date" | "nested" | "array";
export type TableField = {
  header?: string,
  dataType?: TableDataType,
  key?: string
  icon?: string,
  iconColor?: string,
  action?: (...params: any) => any,
  arrayType?: TableDataType,
  nestedType?: TableDataType,
  nestedKey?: string,
}

@Component({
  selector: 'app-payments-table',
  templateUrl: './payments-table.component.html',
  styleUrls: ['./payments-table.component.scss'],
})
export class PaymentsTableComponent implements OnInit {
  @Input() payments: Payment[];
  @Input() liquidations: Liquidation[];
  @Input() contractId: number;

  public permissions: any;
  public paymentsTableFields: TableField[] = [
    {
      key: "paidDocuments",
      header: "Liquidation(s)",
      dataType: "array",
      arrayType: "nested",
      nestedKey: "id"
    },
    {
      key: "date",
      header: "Date",
      dataType: "date"
    },
    {
      key: "paymentMethod",
      header: "method",
      dataType: "text-translate"
    },
    {
      key: "amount",
      header: "Amount",
      dataType: "number"
    },
    // {
    //   key: "proofOfPaymentDocs",
    //   header: "Proof of Payment",
    //   dataType: "button",
    //   icon: "cloud_upload",
    //   iconColor: "accent",
    //   action: this.uploadProof
    // }
  ];

  // INPUTS/PROPERTIES FOR SIMULATING A REUSABLE TABLE
  public data: any[];
  public tableFields: TableField[];
  
  constructor(
    private session: SessionInfo,
    private dialog: MatDialog,
    private snack: SnackbarService,
    private transloco: TranslocoService
  ) {}

  ngOnInit() {
    this.tableFields = this.paymentsTableFields;
    this.permissions = this.session.getPermissions();
  }

  ngOnChanges() {
    this.data = this.payments;
  }

  test(item) {
    console.log("TEST")
    if (item != null) console.log(item)
  }

  async openPayment(payment: Payment) {
    this.dialog.open(SetPaymentDialogComponent, {
      data: {
        payment: { ...payment },
        liquidations: this.liquidations,
        readonly: true
      },
      minWidth: "650px"
    });
  }

  async editPayment(payment: Payment) {
    const dialogRef = this.dialog.open(SetPaymentDialogComponent, {
      data: {
        payment: {
          type: payment.type,
          date: payment.date,
          accountName: payment.accountName,
          paymentMethod: payment.paymentMethod,
          amount: payment.amount,
          paidDocuments: payment.paidDocuments,
          notes: payment.notes
        },
        liquidations: this.liquidations,
        readonly: false
      },
      minWidth: "650px"
    });

    const result: Payment = await lastValueFrom(dialogRef.afterClosed());
    if (!result) return;
    
    payment.update({ ...result }).then(() => {
      this.snack.open("Payment Set", "success");
    }).catch(e => {
      console.error(e);
      this.snack.open("Failed to Set Payment", "error");
    });
  }

  cancelPayment(payment: Payment) {
    payment.update({ status: "cancelled" }).then(() => {
      console.log(payment)
      this.snack.open("Payment Cancelled");
    }).catch(e => {
      console.error(e);
      this.snack.open("Failed to Cancel Payment", "error");
    });
  }

  archivePayment(payment: Payment) {
    // TODO
  }

  async uploadProof(payment: Payment) {
    const dialogData: DialogUploadData = {
      docType: this.transloco.translate("contracts.info.Proof of Payment"),
      locationRef: `/companies/${this.session.getCompany()}/contracts/${this.contractId}/payments/${payment.ref.id}/proofs-of-payment`,
      files: payment.proofOfPaymentDocs.map(doc => ({ ...doc, url: null, dropfile: null, contentType: null })),
      uploadable: payment.status !== "cancelled"
    };

    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      data: dialogData,
      autoFocus: false
    });
    const updateData = await lastValueFrom(dialogRef.afterClosed());
    if (!updateData || !dialogData.uploadable) return;

    updateDoc(payment.ref, {
      proofOfPaymentDocs: updateData,
      status: updateData.length > 0 ? "paid" : "pending"
    })
    .then(() => {
      this.snack.open("Successfully Updated Payment", "success");
    })
    .catch(e => {
      console.error(e);
      this.snack.open("Failed to Update Payment", "error");
    });
  }
  
}
