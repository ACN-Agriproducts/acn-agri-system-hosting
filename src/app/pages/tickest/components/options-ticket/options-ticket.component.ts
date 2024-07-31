import { AddPictureComponent } from './../add-picture/add-picture.component';
import { Component, Input, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { PopoverController, ModalController, NavController, AlertController } from '@ionic/angular';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { lastValueFrom, Observable } from 'rxjs';
import { Ticket } from '@shared/classes/ticket';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { FixTicketStorageComponent } from '@shared/components/fix-ticket-storage/fix-ticket-storage.component';
import { SplitTicketComponent } from 'src/app/standalone/split-ticket/split-ticket.component';
import { ChangeTicketContractComponent } from 'src/app/standalone/change-ticket-contract/change-ticket-contract.component';
import { DiscountsDialogComponent } from '../discounts-dialog/discounts-dialog.component';
import { TicketDialogComponent } from '@shared/printable/printable-ticket/ticket-dialog/ticket-dialog.component';
import { serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { TranslocoService } from '@ngneat/transloco';
import { DialogUploadData, DocumentUploadDialogComponent } from '@shared/components/document-upload-dialog/document-upload-dialog.component';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';

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
    private transloco: TranslocoService,
    private snack: SnackbarService
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
    this.dialog.open(TicketDialogComponent, {
      data: this.ticket,
      panelClass: "borderless-dialog",
      minWidth: "80%",
      maxWidth: "100%",
      height: "75vh"
    });

    this.popoverController.dismiss();
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
      header: this.transloco.translate("messages." + "Alert"),
      message: this.transloco.translate("messages." + "Are you sure you want to void this ticket?"),
      inputs: [
        {
          name: 'voidReason',
          type: 'textarea',
          placeholder: this.transloco.translate("messages." + 'reason'),
          value: this.ticket.voidReason
        }
      ],
      buttons: [
        {
          text: this.transloco.translate("actions." + "Cancel"),
          role: 'cancel'
        },
        {
          text: this.transloco.translate("actions." + "Accept"),
          handler: async (data) => {
            alert.dismiss();

            const updateDoc: any = {}

            if(this.userPermissions.admin || this.userPermissions.tickets.voidTicketAccept) {
              updateDoc.void = true;
              updateDoc.voidRequest = false;
              updateDoc.voidAcceptor = this.userName;
              updateDoc.voidDate = serverTimestamp();

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

  public openContract(): void {
    this.navController.navigateForward(`dashboard/contracts/contract-info/${this.ticket.in? 'purchase' : 'sales'}/${this.ticket.contractRef.id}`);
  }

  public openContact(): void {
    this.navController.navigateForward(`dashboard/directory/contact/${this.ticket.clientRef.id}`)
  }

  public async uploadAttachments(): Promise<void> {
    let locationRef = `/companies/${this.session.getCompany()}/plants/${this.session.getPlant()}/tickets/${this.ticket.id}-${this.ticket.in ? 'in': 'out'}/attachments`;
    
    this.popoverController.dismiss();

    const dialogData: DialogUploadData = {
      docType: this.transloco.translate("tickets.table.Attachments"),
      locationRef,
      files: this.ticket.attachments,
      uploadable: true
    };

    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      data: dialogData,
      autoFocus: false
    });
    const updateData = await lastValueFrom(dialogRef.afterClosed());
    if (!updateData) return;
    
    updateDoc(this.ticket.ref, {
      attachments: updateData
    })
    .then(() => {
      this.snack.openTranslated("Ticket updated", "success");
    })
    .catch(e => {
      console.error(e);
      this.snack.openTranslated("Could not update the ticket.", "error");
    });
  }
}
