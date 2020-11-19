import { ModalController, PopoverController } from '@ionic/angular';
import { ShowContactModalComponent } from './components/show-contact-modal/show-contact-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { OptionsDirectoryComponent } from './components/options-directory/options-directory.component';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.page.html',
  styleUrls: ['./directory.page.scss'],
})
export class DirectoryPage implements OnInit {

  constructor(
    private dialog: MatDialog,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private mediaMatcher: MediaMatcher
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
  private openContactModalMovil = async () => {
    const modal = await this.modalController.create({
      component: ShowContactModalComponent,
      cssClass: 'show-contact-modal-movil',
      swipeToClose: true,
    });
    return await modal.present();
  }
  private openContactModalLap = () => {
    const dialogRef = this.dialog.open(ShowContactModalComponent, {
      autoFocus: false,
      minWidth: '700px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(response => {

    });
  }
  public openContactModal = () => {
    const mediaScreen = this.mediaMatcher.matchMedia('(max-width: 768px)');
    if (mediaScreen.matches) {
      this.openContactModalMovil();
    } else {
      this.openContactModalLap();
    }

  }
}
