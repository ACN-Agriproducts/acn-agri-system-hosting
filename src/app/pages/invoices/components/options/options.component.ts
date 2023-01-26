// import { FileInvoiceComponent } from '@core/mfile-invoice/file-invoice.component';

import { PopoverController, ModalController, NavController } from '@ionic/angular';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { PrintableInvoiceComponent } from '@shared/printable/printable-invoice/printable-invoice.component';
import { Invoice } from '@shared/classes/invoice';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { UploadDialogData, UploadDocumentDialogComponent } from '@shared/components/upload-document-dialog/upload-document-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';


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
      const modal = await this.modalController.create({
        component: PrintableInvoiceComponent,
        componentProps:{
          seller: this.invoice.seller,
          buyer: this.invoice.buyer,
          id: this.invoice.id,
          date: this.invoice.date,
          items: this.invoice.items,
          total: this.invoice.total
        },
        cssClass: 'modal-file-invoice',
        mode: 'md'
     });
     return await modal.present();
  }
  public print = () => {
    this.openInvoice().then(() => {
      window.print();
    });
  }

  public async proofPaymentDoc() {
    const pdfRef = this.invoice.pdfReference ?? 
      `/companies/${this.currentCompany}/invoices/${this.invoice.id}/proofPayment`;

    const dialogData: UploadDialogData = {
      docType: "Proof of Payment",
      hasDoc: this.invoice.pdfReference != null,
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
      pdfReference: updatePdfRef
    })
    .then(() => {
      this.snack.open("Proof of Payment successfully uploaded.", 'success');
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });
  }

  public openFixInvPage(): void {
    this.navController.navigateForward(`dashboard/invoices/item-fixes/${this.invoice.ref.id}`);
  }
}
