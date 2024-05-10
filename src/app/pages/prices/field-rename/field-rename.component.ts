import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-field-rename',
  templateUrl: './field-rename.component.html',
  styleUrls: ['./field-rename.component.scss'],
})
export class FieldRenameComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<FieldRenameComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      name: string,
      invalidNames: string[]
    }
  ) { }

  ngOnInit() {}

  accept() {
    this.dialogRef.close(this.data.name);
  }

  validName() {
    return this.data.invalidNames.every(n => this.data.name != n);
  }
}
