import { Component, Inject, OnInit } from '@angular/core';
import { MatChip } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Contact } from '@shared/classes/contact';

@Component({
  selector: 'app-edit-contact-dialog',
  templateUrl: './edit-contact-dialog.component.html',
  styleUrls: ['./edit-contact-dialog.component.scss'],
})
export class EditContactDialogComponent implements OnInit {
  public contactType: string | null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Contact,
  ) { }

  ngOnInit() {}

  public primaryMetaContact(): any {
    return this.data.metacontacts.find(metacontact => metacontact.isPrimary);
  }

  chipToggle(chip: MatChip, tag: string): void {
    chip.toggleSelected();

    if(this.data.tags.includes(tag)) 
      this.data.tags.splice(this.data.tags.findIndex(t => t == tag), 1);
    else 
      this.data.tags.push(tag);

    console.log(this.data.tags);
  }
}
