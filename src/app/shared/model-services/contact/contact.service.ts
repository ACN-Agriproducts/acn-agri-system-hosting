import { Injectable } from '@angular/core';
import { collection, CollectionReference, Firestore } from '@angular/fire/firestore';
import { CompanyService } from '@core/services/company/company.service';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Company, CompanyContact } from '@shared/classes/company';
import { Contact } from '@shared/classes/contact';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private companyContactList: CompanyContact[];

  constructor(
    private db: Firestore,
    private companyService: CompanyService,
    private snack: SnackbarService,
    private confirm: ConfirmationDialogService
  ) { }

  public getCollectionReference(): CollectionReference {
    return collection(this.companyService.getCompanyReference(), 'directory').withConverter(Contact.converter);
  }

  public getCompanyContacts(): CompanyContact[] {
    return this.companyContactList ??= this.companyService.getContactsList().filter(contact => !contact.tags.includes('archived'));
  }
  

  public getAllCompanyContacts(): CompanyContact[] {
    return this.companyContactList ??= this.companyService.getContactsList();
  }

  public getContactFromId(contactId: string): Promise<Contact> {
    return Contact.getDoc(this.db, this.companyService.getCompany().name, contactId);
  }

  public async archive(contact: Contact | CompanyContact): Promise<boolean> {
    const confirmed = await this.confirm.openDialog(`archive ${contact.name}`);
    if (!confirmed) return;

    const contactToUpdate = contact instanceof CompanyContact ? await this.getContactFromId(contact.id) : contact;

    const newTags = contact.tags;
    newTags.push("archived");

    let archived: boolean;
    try {
      await contactToUpdate.update({ tags: newTags });
      contact.tags = newTags;
      this.snack.openTranslated("contact-update-success", "success");
      archived = true;
    }
    catch (e) {
      console.error(e);
      this.snack.openTranslated("Could not update the contact.", "error");
      archived = false;
    }

    return archived;
  }
}
