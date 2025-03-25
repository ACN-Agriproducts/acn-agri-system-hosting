import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-close-contract-fields-dialog',
  templateUrl: './close-contract-fields-dialog.component.html',
  styleUrls: ['./close-contract-fields-dialog.component.scss'],
})
export class CloseContractFieldsDialogComponent implements OnInit {
  @ViewChild('requiredFieldsForm') public requiredFieldsForm: NgForm

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CloseContractFieldsDialogComponent>,
    private snack: SnackbarService
  ) { }

  ngOnInit() {
    this.snack.openTranslated("Required fields must be filled before closing.");
  }

  public confirm(): void {
    if (this.requiredFieldsForm?.valid) {
      this.dialogRef.close(this.data);
      return;
    }

    this.requiredFieldsForm?.form.markAllAsTouched();
    this.snack.openTranslated("Required fields must be filled before closing.", "error");
  }
}

