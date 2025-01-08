import { ModalController, PopoverController } from '@ionic/angular';
import { ShowModalComponent } from './../show-modal/show-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, Input, OnInit } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  @Input() private data;
  constructor(
    private mediaMatcher: MediaMatcher,
    private dialog: MatDialog,
    private modalController: ModalController,
    private popoverController: PopoverController
  ) { }

  ngOnInit(): void {
  }

  public openModal = () => {
    const mediaScreen = this.mediaMatcher.matchMedia('(max-width: 768px)');
    if (mediaScreen.matches) {
      this.openModalMovil();
    } else {
      this.openModalMovil();
      // this.openModalCompu();
    }
  }
  private openModalCompu = () => {
    this.popoverController.dismiss();
    const dialogRef = this.dialog.open(ShowModalComponent, {
      autoFocus: false,
      minWidth: '700px',
      data: this.data
    });
  }
  private openModalMovil = async () => {
    this.popoverController.dismiss();
    const modal = await this.modalController.create({
      component: ShowModalComponent,
      cssClass: 'showModal-employee',
      componentProps: { dataMovil: this.data }
    });
    return await modal.present();
  }
}
