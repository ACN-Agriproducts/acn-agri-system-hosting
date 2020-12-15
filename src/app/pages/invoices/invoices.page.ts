import { OptionNewInvoiceComponent } from './components/option-new-invoice/option-new-invoice.component';
import { ContextMenuComponent } from './../../core/components/context-menu/context-menu.component';
import { PopoverController, ToastController } from '@ionic/angular';
import { OptionsComponent } from './components/options/options.component';
import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.page.html',
  styleUrls: ['./invoices.page.scss'],
})
export class InvoicesPage implements OnInit {
  public template: any;
  public filter: boolean;
  constructor(
    private popoverController: PopoverController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    const data = document.getElementById('file-html-invoice');
    console.log(data);

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
    console.log(event.nativeElement);
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

}
