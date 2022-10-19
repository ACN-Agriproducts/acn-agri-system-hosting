import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    private snack: SnackbarService,
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.snack.open("Required fields must be filled before closing", 'error');
    this.requiredFieldsForm?.form.markAllAsTouched();
  }

}
