import { AddPictureComponent } from './../add-picture/add-picture.component';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopoverController, ModalController, NavController, AlertController } from '@ionic/angular';
import { ModalTicketComponent } from '../modal-ticket/modal-ticket.component';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-options-ticket',
  templateUrl: './options-ticket.component.html',
  styleUrls: ['./options-ticket.component.scss']
})
export class OptionsTicketComponent implements OnInit {
  @Input() ticket: any;
  @Input() collectionPath: string;
  public downloadURL: Observable<string | null>;
  public downloadString: string;
  public userPermissions: any;

  constructor(
    public dialog: MatDialog,
    public popoverController: PopoverController,
    private modalController: ModalController,
    private storage: AngularFireStorage,
    private navController: NavController,
    private db: AngularFirestore,
    private localStorage: Storage,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    var sub = this.storage.ref(this.ticket.pdfLink).getDownloadURL().subscribe(val => {
      this.downloadString = val;
      sub.unsubscribe();
    });

    this.localStorage.get('user').then(data => {
      this.userPermissions = data.currentPermissions;
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
    var sub = this.downloadURL.subscribe( val => {
      this.navController.navigateForward(val);
      sub.unsubscribe();
    })
  }

  public closePanel = () => {
    this.popoverController.dismiss();
  }

  public async voidTicket(): Promise<void> {
    let alert = await this.alertController.create({
      header: "Alert",
      message: "Are you sure you want to void this ticket?",
      buttons: [
        {
          text: "Cancel",
          role: 'cancel',
        },
        {
          text:"Accept",
          handler: async () => {
            alert.dismiss();
            await this.db.doc(this.collectionPath  + '/' + this.ticket.docId).update(
              this.userPermissions.admin || this.userPermissions.tickets.voidTicketAccept ? 
              {
                void: true,
                voidRequest: false
              } :
              {
                voidRequest: true
              });
          }
        }]
    })

    await alert.present();
  }
}
