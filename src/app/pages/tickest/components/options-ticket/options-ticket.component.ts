import { AddPictureComponent } from './../add-picture/add-picture.component';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopoverController, ModalController, NavController, AlertController } from '@ionic/angular';
import { ModalTicketComponent } from '../modal-ticket/modal-ticket.component';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { Ticket } from '@shared/classes/ticket';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { FixTicketStorageComponent } from '@shared/components/fix-ticket-storage/fix-ticket-storage.component';
import { SplitTicketComponent } from 'src/app/standalone/split-ticket/split-ticket.component';
import { ChangeTicketContractComponent } from 'src/app/standalone/change-ticket-contract/change-ticket-contract.component';
import { DiscountsDialogComponent } from '../discounts-dialog/discounts-dialog.component';

@Component({
  selector: 'app-options-ticket',
  templateUrl: './options-ticket.component.html',
  styleUrls: ['./options-ticket.component.scss']
})
export class OptionsTicketComponent implements OnInit {
  @Input() ticket: Ticket;
  public downloadURL: Observable<string | null>;
  public downloadString: string;
  public userPermissions: any;
  private userName: string;


  constructor(
    public dialog: MatDialog,
    public popoverController: PopoverController,
    private modalController: ModalController,
    private storage: Storage,
    private navController: NavController,
    private alertController: AlertController,
    private session: SessionInfo,
  ) { }

  ngOnInit() {
    this.userPermissions = this.session.getPermissions();
    this.userName = this.session.getUser().name;

    if(this.ticket.pdfLink) {
      getDownloadURL(ref(this.storage, this.ticket.pdfLink)).then(val => {
        this.downloadString = val;
      });
    }
  }
  public openDialog = async () => {
    this.closePanel();
    const modal = await this.modalController.create({
      component: ModalTicketComponent,
      cssClass: 'modal-dialog-ticket',
      componentProps: {
        ticket: this.ticket
      }
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
      inputs: [
        {
          name: 'voidReason',
          type: 'textarea',
          placeholder: 'reason',
          value: this.ticket.voidReason
        }
      ],
      buttons: [
        {
          text: "Cancel",
          role: 'cancel'
        },
        {
          text:"Accept",
          handler: async (data) => {
            alert.dismiss();

            const updateDoc: any = {}

            if(this.userPermissions.admin || this.userPermissions.tickets.voidTicketAccept) {
              updateDoc.void = true;
              updateDoc.voidRequest = false;
              updateDoc.voidAcceptor = this.userName;

              if(!this.ticket.voidRequest) {
                updateDoc.voidReason = data.voidReason;
              }
            } else {
              updateDoc.voidRequest = true;
              updateDoc.voidReason = data.voidReason;
              updateDoc.voidRequester = this.userName
            }

            await this.ticket.update(updateDoc);
          }
        }]
    })

    await alert.present();
  }

  public fixStorageModal(): void {
    this.dialog.open(FixTicketStorageComponent, {
      width: '50%',
      data: this.ticket
    });
    
    this.popoverController.dismiss();
  }

  public splitTicket(): void {
    this.dialog.open(SplitTicketComponent, {
      data: this.ticket
    });

    this.popoverController.dismiss();
  }

  public changeTicketContract(): void {
    this.dialog.open(ChangeTicketContractComponent, {
      data: this.ticket
    });

    this.popoverController.dismiss();
  }

  public discounts(): void {
    this.dialog.open(DiscountsDialogComponent, {
      data: this.ticket,
      autoFocus: false
    });

    this.popoverController.dismiss();
  }
}
