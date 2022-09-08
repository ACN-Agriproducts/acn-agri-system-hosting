import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  constructor(private alertCtrl: AlertController) { }

  public async openConfirmationDialog(action: string, callback: () => void): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: "Confirmation",
      message: `Are you sure you would like to ${action}?`,
      buttons: [
        {
          text: 'yes',
          handler: () => {
            alert.dismiss();
            // callback(); // throws error
          }
        },
        {
          text: 'no',
          role: 'cancel'
        }
      ]
    });
    alert.present();
  }
}
