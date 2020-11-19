import { AddPictureComponent } from './../add-picture/add-picture.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopoverController, ModalController } from '@ionic/angular';
import { ModalTicketComponent } from '../modal-ticket/modal-ticket.component';

@Component({
  selector: 'app-options-ticket',
  templateUrl: './options-ticket.component.html',
  styleUrls: ['./options-ticket.component.scss']
})
export class OptionsTicketComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    public popoverController: PopoverController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }
  public openDialog = async () => {
    this.closePanel();
    const modal = await this.modalController.create({
      component: ModalTicketComponent,
      cssClass: 'modal-dialog-ticket'
    });
    return await modal.present();
  }
  public openDialogAddPicture = async () => {
    this.closePanel();
    // const dialogRef = this.dialog.open(AddPictureComponent, {
    //   autoFocus: false
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   console.log(`Dialog result: ${result}`);
    // });
    const modal = await this.modalController.create({
      component: AddPictureComponent,
      cssClass: ' moda-general-lg',
    });
    return await modal.present();
    // moda-general-lg
  }
  public closePanel = () => {
    this.popoverController.dismiss();
  }
}
