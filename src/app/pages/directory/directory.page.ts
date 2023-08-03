import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { ShowContactModalComponent } from './components/show-contact-modal/show-contact-modal.component';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { OptionsDirectoryComponent } from './components/options-directory/options-directory.component';
import { lastValueFrom, Subscription } from 'rxjs';
import { collectionData, doc, Firestore, limit, orderBy, Query, query, where } from '@angular/fire/firestore';
import { Contact } from '@shared/classes/contact';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { EditContactDialogComponent } from './components/edit-contact-dialog/edit-contact-dialog.component';
import { TranslocoService } from '@ngneat/transloco';
import * as Excel from 'exceljs';
import { Contract } from '@shared/classes/contract';
import { Company } from '@shared/classes/company';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.page.html',
  styleUrls: ['./directory.page.scss'],
})
export class DirectoryPage implements OnInit, OnDestroy {

  private currentSub: Subscription;
  public contacts: Contact[];
  public currentCompany: string;
  public searchQuery: RegExp;
  public stringTest: string;
  public contactType: string;
  public company: Promise<Company>;

  public permissions;

  constructor(
    private db: Firestore,
    private dialog: MatDialog,
    private modalController: ModalController,
    private navController: NavController,
    private popoverController: PopoverController,
    private session: SessionInfo,
    private snack: SnackbarService,
    private transloco: TranslocoService
  ) { }

  ngOnInit() {
    this.currentCompany = this.session.getCompany();
    this.permissions = this.session.getPermissions();
    this.company = Company.getCompany(this.db, this.currentCompany);
    this.updateList();
  }

  ngOnDestroy() {
    if(this.currentSub != null) {
      this.currentSub.unsubscribe();
    }
  }

  updateList = async () => {
    console.log('trigger')
    this.currentSub = collectionData(this.getQuery()).subscribe(val => {
      this.contacts = val;
    });
  }

  private getQuery(): Query<Contact> {
    let q = query(Contact.getCollectionReference(this.db, this.currentCompany));
    if(this.contactType) q = query(q, where('tags', 'array-contains', this.contactType));
    return query(q, orderBy('name', 'asc'));
  }

  public openOptions = async (ev: any) => {
    ev.preventDefault();
    // const popover = await this.popoverController.create({
    //   component: OptionsDirectoryComponent,
    //   cssClass: 'my-custom-class',
    //   event: ev,
    //   translucent: true,
    // });
    // return await popover.present();
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

  public async openNewContact(){
    const newContact = new Contact(doc(Contact.getCollectionReference(this.db, this.session.getCompany())));

    const dialogRef = this.dialog.open(EditContactDialogComponent, {
      autoFocus: false,
      data: newContact
    });

    if (await lastValueFrom(dialogRef.afterClosed()) == null) return;
    newContact.set();
  }

  public async edit(contact: Contact): Promise<void> {
    const metacontacts = [];
    contact.metacontacts.forEach(metaContact => {
      metacontacts.push({ ...metaContact });
    });
    const contactCopy = { ...contact, metacontacts: metacontacts };

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
      metacontacts: data.metacontacts,
      name: data.name.toUpperCase(),
      state: data.state.toUpperCase(),
      streetAddress: data.streetAddress.toUpperCase(),
      tags: data.tags,
      zipCode: data.zipCode,
    })
    .then(() => {
      contact.caat = data.caat;
      contact.city = data.city.toUpperCase();
      contact.metacontacts = data.metacontacts;
      contact.name = data.name.toUpperCase();
      contact.state = data.state.toUpperCase();
      contact.streetAddress = data.streetAddress.toUpperCase();
      contact.tags = data.tags;
      contact.zipCode = data.zipCode;

      this.snack.open(this.transloco.translate("contact-update-success"), "success");
    })
    .catch(error => {
      this.snack.open(error, "error");
    });
  }

  public nav = (route: string): void => {
    this.navController.navigateForward(route, {
      replaceUrl: false
    });
  }

  public search(event: any): void {
    this.searchQuery = new RegExp('^' + event.detail.value.trim().toUpperCase() + '.*', 'i');
  }

  public searchResults = (): Contact[] => this.contacts?.filter(contact => contact?.name?.match(this.searchQuery)) ?? [];

  public async exportCurrent(): Promise<void> {
    const lastContact = await Promise.all(this.contacts.map(c => this.getLastContractDate(c)));

    const workbook = new Excel.Workbook();
    const workSheet = workbook.addWorksheet('Directory');
    workSheet.addTable({
      name: 'directory',
      ref: 'A1',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium2",
        showRowStripes: true,
      },
      columns: [
        {name: "Name", filterButton: true},
        {name: "isClient", filterButton: true},
        {name: "isTrucker", filterButton: true},
        {name: "Contact Name", filterButton: true},
        {name: "Phone", filterButton: true},
        {name: "Email", filterButton: true},
        {name: "StreetAddress", filterButton: true},
        {name: "City", filterButton: true},
        {name: "ZipCode", filterButton: true},
        {name: "State", filterButton: true},
        {name: "Country", filterButton: true},
        {name: "RFC", filterButton: true},
        {name: "CAAT", filterButton: true},
        {name: "Last Contract", filterButton: true},
      ],
      rows: this.contacts.map((contact, index) => [
        contact.name,
        contact.tags.includes('client'),
        contact.tags.includes('trucker'),
        contact.getPrimaryMetaContact()?.name,
        contact.getPrimaryMetaContact()?.phone,
        contact.getPrimaryMetaContact()?.email,
        contact.streetAddress,
        contact.city,
        contact.zipCode,
        contact.state,
        contact.rfc,
        contact.caat,
        lastContact[index]
      ])
    });

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("style", "display: none");
      a.href = url;
      a.download = `${this.currentCompany}-DIRECTORY.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    });
  }

  public async getLastContractDate(contact: Contact): Promise<Date> {
    const result = await Contract.getContracts(this.db, this.currentCompany, null, 
      where('client', '==', contact.ref),
      orderBy('date', 'desc'),
      limit(1));

    if(result.length == 0) {
      return null;
    }

    return result[0].date;
  }
}
