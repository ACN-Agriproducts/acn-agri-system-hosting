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
import { Firestore, where } from '@angular/fire/firestore';
import { lastValueFrom } from 'rxjs';
import * as Excel from "exceljs";
import { Invoice } from '@shared/classes/invoice';
import { orderBy } from 'firebase/firestore';

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
  public userIsDev: boolean;

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
    this.userIsDev = this.session.getPermissions().developer;

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

    const fallback = this.invoiceItemList;
    this.invoiceItemList = newItemListData;

    const complete = this.invoiceItemList.every(item => {
      item.set().catch(error => {
        console.error(error);
        this.snack.openTranslated("Error while updating item list.", 'error');
        this.invoiceItemList = fallback;
        return false;
      });
      return true;
    });

    if (complete) this.snack.openTranslated("Item list updated", 'success');
  }

  chosenYearHandler(event: any) {
    console.log(typeof event)
  }

  chosenMonthHandler(event: any, datepicker: MatDatepicker<any>) {

  }

  async exportInvoices() {
    let invoices = await Invoice.getDocs(this.db, this.session.getCompany());
    const exludedInvoices = invoices.filter(i => !(i.isExportInvoice || i.items.some(item => item.affectsInventory)) || i.status == 'cancelled');
    invoices = invoices.filter(i => (i.isExportInvoice || i.items.some(item => item.affectsInventory)) && i.status != 'cancelled');
    invoices.sort((a,b) => b.id - a.id);

    const sheetData: {[product: string]: Invoice[]} = {};

    for(const invoice of invoices) {
      if(invoice.isExportInvoice) {
        (sheetData[invoice.exportInfo.product] ??= []).push(invoice);
      }
      else {
        const products: string[] = [];
        for(const item of invoice.items) {
          if(!item.affectsInventory) continue;
          
          for(const invInfo of item.inventoryInfo) {
            if(products.includes(invInfo.product)) continue;
            (sheetData[invInfo.product] ??= []).push(invoice);
            products.push(invInfo.product);
          }
        }
      }
    }

    const workbook = new Excel.Workbook();

    for(const product in sheetData) {
      const sheet = workbook.addWorksheet(product);
  
      sheet.columns = [
        { header: "ID"},
        { header: "FECHA"},
        { header: "NOMBRE"},
        { header: "ESTATUS"},
        { header: "CANTIDAD"},
        { header: "MONTO"},
      ];
  
      console.log(product);
      console.table(sheetData[product], ["id", "date", "buyer", "exportInfo", "total"])
  
      sheet.addRows(sheetData[product].map(invoice => [
        invoice.id,
        invoice.date,
        invoice.buyer.name,
        invoice.status,
        invoice.getProductQuantity(product).getMassInUnit('mTon'),
        invoice.total
      ]));
    }

    const fSheet = workbook.addWorksheet('Filtered Out');
    fSheet.columns = [
      { header: "ID"},
      { header: "FECHA"},
      { header: "NOMBRE"},
      { header: "MONTO"},
      { header: "ESTATUS"}
    ];

    fSheet.addRows(exludedInvoices.map(invoice => [
      invoice.id,
      invoice.date,
      invoice.buyer.name,
      invoice.total,
      invoice.status
    ]));


    workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			});
	  
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.setAttribute("style", "display: none");
			a.href = url;
			a.download = `report.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			a.remove();
		});
  }

}
