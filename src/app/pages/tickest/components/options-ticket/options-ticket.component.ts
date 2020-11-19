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
    });
    return await modal.present();
  }
  openDialogAddPicture() {
    this.closePanel();
    const dialogRef = this.dialog.open(AddPictureComponent, {
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  public closePanel = () => {
    this.popoverController.dismiss();
  }
}
