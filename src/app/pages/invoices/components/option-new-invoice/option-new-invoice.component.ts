import { PopoverController, NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-option-new-invoice',
  templateUrl: './option-new-invoice.component.html',
  styleUrls: ['./option-new-invoice.component.scss']
})
export class OptionNewInvoiceComponent implements OnInit {

  constructor(
    private popoverController: PopoverController,
    private navController: NavController
  ) { }

  ngOnInit(): void {
  }

  public goRuta = (ruta: string) => {
    this.navController.navigateForward(ruta).then(() => {
      this.popoverController.dismiss();
    });
  }
}
