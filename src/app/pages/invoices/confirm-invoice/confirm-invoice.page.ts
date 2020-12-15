import { NavController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-confirm-invoice',
  templateUrl: './confirm-invoice.page.html',
  styleUrls: ['./confirm-invoice.page.scss'],
})
export class ConfirmInvoicePage implements OnInit {

  constructor(
   private navController: NavController
  ) { }

  ngOnInit() {
    this.navController.navigateForward('')
  }

}
