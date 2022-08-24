import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-contract-dialog',
  templateUrl: './upload-contract-dialog.component.html',
  styleUrls: ['./upload-contract-dialog.component.scss'],
})
export class UploadContractDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<UploadContractDialogComponent>,
  ) { }

  ngOnInit() {}

  public cancel(): void {
    this.dialogRef.close();
  }
}
