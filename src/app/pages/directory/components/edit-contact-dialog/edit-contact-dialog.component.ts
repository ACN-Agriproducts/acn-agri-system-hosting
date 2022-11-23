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
  public contactType: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Contact,
    private dialogRef: MatDialogRef<EditContactDialogComponent>,
    private snack: SnackbarService,
  ) { }

  ngOnInit() {
    this.contactType = this.data.tags.includes('client') ? "client" :
      this.data.tags.includes('trucker') ? "trucker" : "";
  }

}
