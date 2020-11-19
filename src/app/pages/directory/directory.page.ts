import { ModalController, PopoverController } from '@ionic/angular';
import { ShowContactModalComponent } from './components/show-contact-modal/show-contact-modal.component';
import { Component, OnInit } from '@angular/core';
import { OptionsDirectoryComponent } from './components/options-directory/options-directory.component';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.page.html',
  styleUrls: ['./directory.page.scss'],
})
export class DirectoryPage implements OnInit {

  constructor(
    private popoverController: PopoverController,
    private modalController: ModalController,

  ) { }

  ngOnInit() {
  }

  public openOptions = async (ev: any) => {
    ev.preventDefault();
    const popover = await this.popoverController.create({
      component: OptionsDirectoryComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    return await popover.present();
  }
  public openContactModal = async () => {
    const modal = await this.modalController.create({
      component: ShowContactModalComponent,
      cssClass: 'modal-contact',
      swipeToClose: true,
    });
    return await modal.present();
  }

}
