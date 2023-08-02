import { Component, Inject, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MatChip } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company } from '@shared/classes/company';
import { Contact } from '@shared/classes/contact';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-contact-dialog',
  templateUrl: './edit-contact-dialog.component.html',
  styleUrls: ['./edit-contact-dialog.component.scss'],
})
export class EditContactDialogComponent implements OnInit {
  public contactType: string | null;
  public otherTags: string[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Contact,
    private dialog: MatDialog,
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    Company.getCompany(this.db, this.session.getCompany()).then(company => {
      this.otherTags = company.companyTags;
    });
  }

  public primaryMetaContact(): any {
    return this.data.metacontacts.find(metacontact => metacontact.isPrimary);
  }

  public newTagDialog(): any {
    const dialogRef = this.dialog.open(AddNewTagDialogComponent);
    lastValueFrom(dialogRef.afterClosed()).then(result => {
      if(!result || result == 'client' || result == 'trucker' || this.otherTags.includes(result)) return;
      this.otherTags.push(result);
      this.data.tags.push(result);
    });
  }

  chipToggle(chip: MatChip, tag: string): void {
    chip.toggleSelected();

    if(this.data.tags.includes(tag)) 
      this.data.tags.splice(this.data.tags.findIndex(t => t == tag), 1);
    else 
      this.data.tags.push(tag);
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