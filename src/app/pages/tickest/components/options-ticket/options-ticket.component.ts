import { AddPictureComponent } from './../add-picture/add-picture.component';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopoverController, ModalController, NavController } from '@ionic/angular';
import { ModalTicketComponent } from '../modal-ticket/modal-ticket.component';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-options-ticket',
  templateUrl: './options-ticket.component.html',
  styleUrls: ['./options-ticket.component.scss']
})
export class OptionsTicketComponent implements OnInit {
  @Input() ticket: any;
  public downloadURL: Observable<string | null>;
  public downloadString: string;

  constructor(
    public dialog: MatDialog,
    public popoverController: PopoverController,
    private modalController: ModalController,
    private storage: AngularFireStorage,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.storage.ref(this.ticket.pdfLink).getDownloadURL().subscribe(val => {
      this.downloadString = val;
    });
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

  public downloadTicket = () => {
    this.downloadURL.subscribe( val => {
      this.navController.navigateForward(val);
    })
  }

  public closePanel = () => {
    this.popoverController.dismiss();
  }
}
