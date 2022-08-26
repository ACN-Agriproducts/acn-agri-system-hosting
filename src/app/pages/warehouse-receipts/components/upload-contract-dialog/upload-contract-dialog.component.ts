import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-contract-dialog',
  templateUrl: './upload-contract-dialog.component.html',
  styleUrls: ['./upload-contract-dialog.component.scss'],
})
export class UploadContractDialogComponent implements OnInit {
  public files: File[] = [];

  constructor(
    public dialogRef: MatDialogRef<UploadContractDialogComponent>,
  ) { }

  ngOnInit() {}

  public onSelect(event: any):void {
    console.log(event);
    this.files = [];
    this.files.push(...event.addedFiles);
  }

  public onRemove(event: any):void {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
