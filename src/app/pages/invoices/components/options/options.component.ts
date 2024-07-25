// import { FileInvoiceComponent } from '@core/mfile-invoice/file-invoice.component';

import { PopoverController, ModalController, NavController } from '@ionic/angular';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { PrintableInvoiceComponent } from '@shared/printable/printable-invoice/printable-invoice.component';
import { Invoice } from '@shared/classes/invoice';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { UploadDialogData, UploadDocumentDialogComponent } from '@shared/components/upload-document-dialog/upload-document-dialog.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { lastValueFrom } from 'rxjs';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { InvoiceDialogComponent } from '@shared/printable/printable-invoice/invoice-dialog/invoice-dialog.component';
import { TranslocoService } from '@ngneat/transloco';


@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  @Input() public invoice: Invoice;

  public currentCompany: string;


  constructor(
    private clipboard: Clipboard,
    private dialog: MatDialog,
    private modalController: ModalController,
    private navController: NavController,
    private popoverController: PopoverController,
    private session: SessionInfo,
    private snack: SnackbarService,
    private storage: Storage,
    private transloco: TranslocoService
  ) { }

  ngOnInit(): void {
    this.currentCompany = this.session.getCompany();
  }

  public addClipboard = (itemCilpboard: string) => {
    let clipboard = [];
    this.storage.get('clipboard').then(data => {
      if (data) {
        clipboard = data;
        clipboard.push(itemCilpboard);
        this.storage.set('clipboard', clipboard);
      } else {
        this.storage.set('clipboard', itemCilpboard);
      }
    });
  }

  public openInvoice = async () => {
    this.popoverController.dismiss(null);
    const dialog = this.dialog.open(
      InvoiceDialogComponent, 
      {
        data: this.invoice,
        panelClass: "borderless-dialog",
        minWidth: "80%",
        maxWidth: "100%",
        height: "75vh"
      }
    );
  }
  
  public print = () => {
    this.openInvoice().then(() => {
      window.print();
    });
  }

  public async proofPaymentDoc() {
    const pdfRef = this.invoice.proofLinks?.[0] ?? 
      `/companies/${this.currentCompany}/invoices/${this.invoice.id}/proofPayment`;

    const dialogData: UploadDialogData = {
      docType: this.transloco.translate("invoices."+"Proof of Payment"),
      hasDoc: this.invoice.proofLinks != null,
      pdfRef,
      uploadable: this.invoice.status !== 'closed'
    };

    const dialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      data: dialogData,
      autoFocus: false
    });
    const updatePdfRef = await lastValueFrom(dialogRef.afterClosed());
    if (updatePdfRef == null) return;

    this.invoice.update({
      proofLinks: [updatePdfRef],
      status: "paid"
    })
    .then(() => {
      this.snack.openTranslated("Proof of payment uploaded", 'success');
    })
    .catch(error => {
      console.error(error);
      this.snack.openTranslated("Could not upload the proof of payment.", 'error');
    });
  }

  public openFixInvPage(): void {
    this.navController.navigateForward(`dashboard/invoices/item-fixes/${this.invoice.ref.id}`);
  }

  public cancelInvoice(): void {
    this.invoice.update({
      status: "cancelled"
    })
    .then(() => {
      this.snack.openTranslated("Invoice cancelled", "success");
    })
    .catch(error => {
      console.error(error);
      this.snack.openTranslated("Could not cancel the invoice.", "error");
    });
  }
}
