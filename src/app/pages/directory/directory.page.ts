import { NavController } from '@ionic/angular';
import { Component, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { doc, Firestore, limit, orderBy, Query, query, where } from '@angular/fire/firestore';
import { Contact } from '@shared/classes/contact';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { EditContactDialogComponent } from './components/edit-contact-dialog/edit-contact-dialog.component';
import { TranslocoService } from '@ngneat/transloco';
import * as Excel from 'exceljs';
import { Contract } from '@shared/classes/contract';
import { Company } from '@shared/classes/company';
import { TruckerFieldsDialog } from './components/trucker-fields-dialog/trucker-fields.dialog';
import { Pagination } from '@shared/classes/FirebaseDocInterface';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.page.html',
  styleUrls: ['./directory.page.scss'],
})
export class DirectoryPage implements OnInit, OnDestroy {
  private currentSub: Subscription;
  public contactsPagination: Pagination<Contact>;
  public currentCompany: string;
  public searchQuery: RegExp;
  public contactType: string;
  public deliveryCity: string;
  public company: Promise<Company>;
  public arrayChangeFlag: number;

  public permissions;

  constructor(
    private db: Firestore,
    private dialog: MatDialog,
    private navController: NavController,
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
    this.arrayChangeFlag = 0; // Will update when list gets any updates
    this.contactsPagination = new Pagination(this.getQuery(), 10000, () => {
      this.arrayChangeFlag++;
    });
  }

  private getQuery(): Query<Contact> {
    let q = query(Contact.getCollectionReference(this.db, this.currentCompany));
    if(this.contactType) q = query(q, where('tags', 'array-contains', this.contactType));
    return query(q, orderBy('name', 'asc'));
  }

  public openOptions = async (ev: any) => {
    ev.preventDefault();
  }

  public async openNewContact(){
    const newContact = new Contact(doc(Contact.getCollectionReference(this.db, this.session.getCompany())));

    const dialogRef = this.dialog.open(EditContactDialogComponent, {
      autoFocus: false,
      data: {contact: newContact, otherTags: (await this.company).companyTags}
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
      data: {contact: contactCopy, otherTags: (await this.company).companyTags},
    });
    const newContactData = await lastValueFrom(dialogRef.afterClosed());
    if (newContactData == null) return;

    this.updateContact(contact, newContactData);
  }

  public updateContact(contact: Contact, data: Contact): void {
    contact.update({
      caat: data.caat,
      city: data.city?.toUpperCase() ?? null,
      metacontacts: data.metacontacts,
      name: data.name?.toUpperCase() ?? null,
      state: data.state?.toUpperCase() ?? null,
      streetAddress: data.streetAddress?.toUpperCase() ?? null,
      tags: data.tags,
      zipCode: data.zipCode,
    })
    .then(() => {
      this.snack.openTranslated("contact-update-success", "success");
    })
    .catch(error => {
      console.error(error);
      this.snack.openTranslated("Could not update the contact.", "error");
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

  public searchResults(list: Contact[], searchQuery: RegExp, contactType: string, deliveryCity: string): Contact[] {
    let result = list?.filter(contact => contact?.name?.match(searchQuery)) ?? [];
    if(contactType == "trucker" && deliveryCity) {
      const destinationQuery = new RegExp('^' + deliveryCity.trim().toUpperCase() + '.*', 'i')
      result = result.filter(contact => contact?.destinations?.some(d => d.toUpperCase().match(destinationQuery)))
    }
    return result;
  }

  public async exportCurrent(): Promise<void> {
    const contacts = this.contactsPagination.list;
    const contracts = await Contract.getContracts(this.db, this.session.getCompany());
    const contactContractsInfo: {
      lastContract: Date;
      CornAmmount22: number;
      SorghumAmmount22: number;
      CornAmmount23: number;
      SorghumAmmount23: number;
      hasPurchaseContract: boolean;
    }[] = [];
    const initDate = new Date(2000, 1, 1);

    contacts.forEach(contact => {
      const contactContracts = contracts.filter(c => c.client.id == contact.ref.id && (c.type == 'purchase' || c.tags?.includes('purchase')));
      
      contactContractsInfo.push({
        lastContract: contactContracts.map(c => c.date).reduce((a, b) => a > b ? a : b, new Date(2000, 1, 1)),
        CornAmmount22: contactContracts.filter(c => c.date.getFullYear() == 2022 && c.product.id == 'Yellow Corn')
                          .map(c => c.status == 'closed' ? c.currentDelivered.getMassInUnit('mTon') : Math.max(c.currentDelivered.getMassInUnit('mTon'), c.quantity.getMassInUnit('mTon')))
                          .reduce((a, b) => a + b, 0),
        SorghumAmmount22: contactContracts.filter(c => c.date.getFullYear() == 2022 && c.product.id == 'Sorghum')
                          .map(c => c.status == 'closed' ? c.currentDelivered.getMassInUnit('mTon') : Math.max(c.currentDelivered.getMassInUnit('mTon'), c.quantity.getMassInUnit('mTon')))
                          .reduce((a, b) => a + b, 0),
        CornAmmount23: contactContracts.filter(c => c.date.getFullYear() == 2023 && c.product.id == 'Yellow Corn')
                          .map(c => c.status == 'closed' ? c.currentDelivered.getMassInUnit('mTon') : Math.max(c.currentDelivered.getMassInUnit('mTon'), c.quantity.getMassInUnit('mTon')))
                          .reduce((a, b) => a + b, 0),
        SorghumAmmount23: contactContracts.filter(c => c.date.getFullYear() == 2023 && c.product.id == 'Sorghum')
                          .map(c => c.status == 'closed' ? c.currentDelivered.getMassInUnit('mTon') : Math.max(c.currentDelivered.getMassInUnit('mTon'), c.quantity.getMassInUnit('mTon')))
                          .reduce((a, b) => a + b, 0),
        hasPurchaseContract: contactContracts.some(c => c.type == 'purchase' || c.tags?.includes('purchase'))
      });
    });

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
        {name: "Has Purchsae", filterButton: true},
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
        {name: "Yellow Corn 22", filterButton: true},
        {name: "Sorgum 22", filterButton: true},
        {name: "Yellow Corn 23", filterButton: true},
        {name: "Sorgum 23", filterButton: true},
      ],
      rows: contacts.map((contact, index) => [
        contact.name,
        contact.tags.includes('client'),
        contact.tags.includes('trucker'),
        contactContractsInfo[index].hasPurchaseContract,
        contact.getPrimaryMetaContact()?.name,
        contact.getPrimaryMetaContact()?.phone,
        contact.getPrimaryMetaContact()?.email,
        contact.streetAddress,
        contact.city,
        contact.zipCode,
        contact.state,
        contact.country,
        contact.rfc,
        contact.caat,
        initDate.getTime() == contactContractsInfo[index].lastContract.getTime() ? '-' : contactContractsInfo[index].lastContract,
        contactContractsInfo[index].CornAmmount22 == 0? '-' : contactContractsInfo[index].CornAmmount22,
        contactContractsInfo[index].SorghumAmmount22 == 0? '-' : contactContractsInfo[index].SorghumAmmount22,
        contactContractsInfo[index].CornAmmount23 == 0? '-' : contactContractsInfo[index].CornAmmount23,
        contactContractsInfo[index].SorghumAmmount23 == 0? '-' : contactContractsInfo[index].SorghumAmmount23,
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

  public editTransportField(contact: Contact) {
    const dialogRef = this.dialog.open(TruckerFieldsDialog, {
      data: contact
    });
  }
}

@Pipe({
  name: 'search',
})

export class SearchPipe implements PipeTransform {
  transform(
    value: Contact[], 
    searchFunc: (list: Contact[], searchQuery: RegExp, contactType: string, deliveryCity: string) => Contact[], 
    searchQuery: RegExp, 
    contactType: string,  
    deliveryCity: string,
    ...other: any): any {
    return searchFunc(value, searchQuery, contactType, deliveryCity);
  }
}
