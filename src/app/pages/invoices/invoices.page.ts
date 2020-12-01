import { ContextMenuComponent } from './../../core/components/context-menu/context-menu.component';
import { PopoverController, ToastController } from '@ionic/angular';
import { OptionsComponent } from './components/options/options.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.page.html',
  styleUrls: ['./invoices.page.scss'],
})
export class InvoicesPage implements OnInit {

  public filter: boolean;
  constructor(
    private popoverController: PopoverController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
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
}
