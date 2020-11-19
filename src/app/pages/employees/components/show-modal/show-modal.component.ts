import { ShowPictureComponent } from './../show-picture/show-picture.component';
import { PopoverController, ModalController } from '@ionic/angular';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-show-modal',
  templateUrl: './show-modal.component.html',
  styleUrls: ['./show-modal.component.scss']
})
export class ShowModalComponent implements OnInit {

  public dataEmployee;
  @Input() public dataMovil;
  constructor(
    private popoverController: PopoverController,
    private mediaMatcher: MediaMatcher,
    private dialog: MatDialog,
    private modalController: ModalController,
  ) { }

  ngOnInit(): void {
    this.switchData();
  }
  private switchData = () => {
    console.log(this.dataMovil);

    const mediaScreen = this.mediaMatcher.matchMedia('(max-width: 768px)');
    this.dataEmployee = mediaScreen.matches ? this.dataMovil : this.dataMovil;
  }
  public closeModal = () => {
    this.modalController.dismiss();
  }
  public showPicture = (picture: string) => {
    const mediaScreen = this.mediaMatcher.matchMedia('(max-width: 768px)');
    if (mediaScreen.matches) {
      this.openPictueMovil(picture);
    } else {
      this.openPictueCompu(picture);
    }
  }
  private openPictueCompu = (picture: string) => {
    const dialogRef = this.dialog.open(ShowPictureComponent, {
      autoFocus: false,
      minWidth: '500px',
      data: picture
    });
  }
  private openPictueMovil = async (picture: string) => {
    const modal = await this.modalController.create({
      component: ShowPictureComponent,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }
}
