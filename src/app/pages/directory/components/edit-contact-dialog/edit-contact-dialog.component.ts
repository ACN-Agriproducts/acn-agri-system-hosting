import { Component, Inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MatChip } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contact, MetaContact } from '@shared/classes/contact';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-contact-dialog',
  templateUrl: './edit-contact-dialog.component.html',
  styleUrls: ['./edit-contact-dialog.component.scss'],
})
export class EditContactDialogComponent implements OnInit {
  public contactType: string | null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {contact: Contact, otherTags: string[]},
    private dialog: MatDialog
  ) { }

  ngOnInit() {

  }

  public primaryMetaContact(): any {
    return this.data.contact.metacontacts.find(metacontact => metacontact.isPrimary);
  }

  public newTagDialog(): any {
    const dialogRef = this.dialog.open(AddNewTagDialogComponent);
    lastValueFrom(dialogRef.afterClosed()).then(result => {
      if(!result || result == 'client' || result == 'trucker' || this.data.otherTags.includes(result)) return;
      this.data.otherTags.push(result);
      this.data.contact.tags.push(result);
    });
  }

  chipToggle(chip: MatChip, tag: string): void {
    chip.toggleSelected();

    if(this.data.contact.tags.includes(tag)) 
      this.data.contact.tags.splice(this.data.contact.tags.findIndex(t => t == tag), 1);
    else 
      this.data.contact.tags.push(tag);
  }

  createNewMetacontact(): void {
    this.data.contact.metacontacts.push({
      email: null,
      isPrimary: false,
      name: null,
      phone: null,
    });
  }

  promoteToPrimary(contact: MetaContact) {
    this.primaryMetaContact().isPrimary = false;
    contact.isPrimary = true;
  }

  removeMetacontact(index: number) {
    if(this.data.contact.metacontacts.length <= 1) return;
    const contact = this.data.contact.metacontacts[index];
    this.data.contact.metacontacts.splice(index, 1);

    // Make sure some contact is always primary
    if(contact.isPrimary) {
      this.data.contact.metacontacts[0].isPrimary = true;
    }
  }
}

@Component({
  template: `
    <ng-container *transloco="let t, read: 'directory'">
      <h2 mat-dialog-title>New Tag</h2>
      <mat-dialog-content>
        <mat-form-field>
          <input matInput [(ngModel)]='tag' />
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions class="action-bar">
        <button mat-button color="primary" [mat-dialog-close]="null">{{t('Cancel')}}</button>
        <button mat-button color="primary" [mat-dialog-close]="tag | lowercase">{{t('Save')}}</button>
      </mat-dialog-actions>
    </ng-container>
  `
})
export class AddNewTagDialogComponent {
  public tag: string;
}

@Pipe({
  name: 'primary',
})
export class PrimaryPipe implements PipeTransform {
  transform(list: any[], fieldName:string, ...args: any[]) {
    const index = list.findIndex(c => c[fieldName]);
    const primaryContact = list[index];
    list.splice(index, 1);
    list.unshift(primaryContact);
    return list;
  }
}