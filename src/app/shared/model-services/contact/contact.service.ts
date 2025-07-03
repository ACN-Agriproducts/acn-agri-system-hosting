import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { CompanyService } from '@core/services/company/company.service';
import { CompanyContact } from '@shared/classes/company';
import { Contact } from '@shared/classes/contact';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contactList: Contact[];
  private companyContactList: CompanyContact[];

  constructor(
    private db: Firestore,
    private companyService: CompanyService
  ) { }

  public getList(): CompanyContact[] {
    return this.companyContactList ??= this.companyService.getContactsList();
  }

  public getContactFromId(contactId: string): Promise<Contact> {
    return Contact.getDoc(this.db, this.companyService.getCompany().name, contactId);
  }

  public async archive(contact: Contact | CompanyContact): Promise<void> {
    const id = contact instanceof Contact ? contact.ref.id : contact.id;
    contact = await this.getContactFromId(id);

    contact.update({ archived: true })
    .then(() => {
        contact.archived = true;
    })
    .catch((e) => {
        contact.archived = false;
        console.error(e);
    });
  }
}
