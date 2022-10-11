import { OptionNewInvoiceComponent } from './components/option-new-invoice/option-new-invoice.component';
import { ContextMenuComponent } from './../../core/components/context-menu/context-menu.component';
import { PopoverController, ToastController } from '@ionic/angular';
import { OptionsComponent } from './components/options/options.component';
import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { SetItemsDialogComponent } from './components/set-items-dialog/set-items-dialog.component';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { InvoiceItem } from '@shared/classes/invoice_item';
import { Firestore } from '@angular/fire/firestore';
import { lastValueFrom } from 'rxjs';
@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.page.html',
  styleUrls: ['./invoices.page.scss'],
})
export class InvoicesPage implements OnInit {
  public date: Date;
  public filter: boolean;
  public template: any;
  public currentCompany: string;
  public invoiceItemList: InvoiceItem[];

  constructor(
    private dialog: MatDialog,
    private popoverController: PopoverController,
    private snack: SnackbarService,
    private toastController: ToastController,
    private db: Firestore,
    private session: SessionInfo,
    ) { }

  ngOnInit() {
    const data = document.getElementById('file-html-invoice');
    this.currentCompany = this.session.getCompany();

    InvoiceItem.getCollectionValueChanges(this.db, this.currentCompany).subscribe(list => {
      this.invoiceItemList = list;
    });
  }

  public openContextMenu = async (ev) => {
    ev.preventDefault();
    const options = await this.popoverController.create({
      component: ContextMenuComponent,
      event: ev
    });
    return await options.present();
  }
  async presentToast(event) {
    const toast = await this.toastController.create({
      message: 'Your settings have been saved.',
      duration: 2000,
      position: 'bottom',
      mode: 'ios',
      keyboardClose: true,
      header: 'Header to be shown in the toast.',
      color: 'dark',
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
  }
  public captureScreen() {
    try {

      const data = document.getElementById('exam-file-html-invoice');
      const option = { allowTaint: true, useCORS: true };
      if (!data) {
        return;
      }
      html2canvas(document.querySelector('#exam-file-html-invoice')).then(canvas => {
        // Few necessary setting options
        console.log(canvas);
        
        // const imgWidth = 208;
        // const pageHeight = 295;
        // const imgHeight = canvas.height * imgWidth / canvas.width;
        // const heightLeft = imgHeight;
        // const pdf = new jsPDF('p', 'pt', [canvas.width, canvas.height]);
        // const contentDataURL = canvas.toDataURL('image/png', 1.0);
        // pdf.addImage(contentDataURL, 0, 0, canvas.width, canvas.height);
        // pdf.save('converteddoc.pdf');
      });
    } catch (error) {
      console.log(error);

    }
  }
  fileInvoice(event) {
    this.template = event.nativeElement;
  }

  public openOption = async (event) => {
    const popover = await this.popoverController.create({
      component: OptionNewInvoiceComponent,
      cssClass: '',
      event,
      showBackdrop: false
    });
    return await popover.present();
  }

  public setInvoiceItems = async (): Promise<void> => {
    const dialogRef = this.dialog.open(SetItemsDialogComponent, {
      autoFocus: false
    });
    const newItemListData = await lastValueFrom(dialogRef.afterClosed());
    if (newItemListData == null) return;

    console.log(this.invoiceItemList);
    console.log(newItemListData);

    const fallback = this.invoiceItemList;
    this.invoiceItemList = newItemListData;

    const complete = this.invoiceItemList.every(item => {
      item.set().catch(error => {
        this.snack.open(error, 'error');
        this.invoiceItemList = fallback;
        return false;
      });
      return true;
    });

    if (complete) this.snack.open("Item List Successfully Updated", 'success');
  }

  chosenYearHandler(event: any) {
    console.log(typeof event)
  }

  chosenMonthHandler(event: any, datepicker: MatDatepicker<any>) {

  }

}
