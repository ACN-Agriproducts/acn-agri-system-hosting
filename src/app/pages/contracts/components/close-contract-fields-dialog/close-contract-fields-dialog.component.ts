import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { TranslocoService } from '@ngneat/transloco';

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
    private snack: SnackbarService,
    private transloco: TranslocoService
  ) { }

  ngOnInit() {
    this.snack.open(this.transloco.translate("messages." + "Required fields must be filled before closing"), 'error');
  }

  public confirm(): void {
    if (this.requiredFieldsForm?.valid) {
      this.dialogRef.close(this.data);
      return;
    }

    this.requiredFieldsForm?.form.markAllAsTouched();
    this.snack.open(this.transloco.translate("messages." + "Required fields must be filled before closing"), "error");
  }
}

