import { Component, Inject, OnInit } from '@angular/core';
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
}
