// import { FileInvoiceComponent } from '@core/mfile-invoice/file-invoice.component';

import { PopoverController, ModalController } from '@ionic/angular';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { PrintableInvoiceComponent } from '../printable-invoice/printable-invoice.component';


@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  @Input() public invoice: any;

  constructor(
    private clipboard: Clipboard,
    private popoverController: PopoverController,
    private storage: Storage,
    private modalController: ModalController
  ) { }

  ngOnInit(): void {}
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
          date: this.invoice.date.toDate(),
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
}
