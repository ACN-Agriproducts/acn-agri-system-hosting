import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { ShowContactModalComponent } from './components/show-contact-modal/show-contact-modal.component';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { OptionsDirectoryComponent } from './components/options-directory/options-directory.component';
import { lastValueFrom, Subscription } from 'rxjs';
import { Storage } from '@ionic/storage';
import { collectionData, Firestore, orderBy, query } from '@angular/fire/firestore';
import { Contact } from '@shared/classes/contact';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { EditContactDialogComponent } from './components/edit-contact-dialog/edit-contact-dialog.component';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.page.html',
  styleUrls: ['./directory.page.scss'],
})
export class DirectoryPage implements OnInit, OnDestroy {

  public contacts: any[]
  public stringTest: string
  public currentCompany: string
  private currentSub: Subscription;

  constructor(
    private db: Firestore,
    private dialog: MatDialog,
    private modalController: ModalController,
    private navController: NavController,
    private popoverController: PopoverController,
    private session: SessionInfo,
    private snack: SnackbarService,
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
    this.updateList();
  }

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

  private updateList = async () => {
    this.currentSub = collectionData(query(Contact.getCollectionReference(this.db, this.currentCompany), orderBy('name'))).subscribe(val => this.contacts = val);
  }

  public openOptions = async (ev: any) => {
    ev.preventDefault();
    const popover = await this.popoverController.create({
      component: OptionsDirectoryComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });
    return await popover.present();
  }

  public openContactModal = async (index) => {
    const modal = await this.modalController.create({
      component: ShowContactModalComponent,
      cssClass: 'modal-contact',
      swipeToClose: true,
      componentProps: {
        data: this.contacts[index]
      }
    });
    return await modal.present();
  }

  public openNewContact(){
    this.navController.navigateForward('dashboard/directory/new')
  }

  public async edit(contact: Contact): Promise<void> {
    const metaContacts = [];
    contact.metaContacts.forEach(metaContact => {
      metaContacts.push({ ...metaContact });
    });
    const contactCopy = { ...contact, metaContacts: metaContacts };

    const dialogRef = this.dialog.open(EditContactDialogComponent, {
      autoFocus: false,
      data: contactCopy,
    });
    const newContactData = await lastValueFrom(dialogRef.afterClosed());
    if (newContactData == null) return;

    this.updateContact(contact, newContactData);
  }

  public updateContact(contact: Contact, data: Contact): void {
    contact.update({
      caat: data.caat,
      city: data.city.toUpperCase(),
      metaContacts: data.metaContacts,
      name: data.name.toUpperCase(),
      state: data.state.toUpperCase(),
      streetAddress: data.streetAddress.toUpperCase(),
      tags: data.tags,
      zipCode: data.zipCode,
    })
    .then(() => {
      contact.caat = data.caat;
      contact.city = data.city.toUpperCase();
      contact.metaContacts = data.metaContacts;
      contact.name = data.name.toUpperCase();
      contact.state = data.state.toUpperCase();
      contact.streetAddress = data.streetAddress.toUpperCase();
      contact.tags = data.tags;
      contact.zipCode = data.zipCode;

      this.snack.open("Contact successfully updated", "success");
    })
    .catch(error => {
      this.snack.open(error, "error");
    });
  }

  public archive(id: string): void {
    
  }

  public nav = (route: string): void => {
    this.navController.navigateForward(route, {
      replaceUrl: false
    });
  }
}
