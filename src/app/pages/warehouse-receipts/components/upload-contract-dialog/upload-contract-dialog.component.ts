import { Component, Inject, OnInit } from '@angular/core';
import { ref, Storage } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-upload-contract-dialog',
  templateUrl: './upload-contract-dialog.component.html',
  styleUrls: ['./upload-contract-dialog.component.scss'],
})
export class UploadContractDialogComponent implements OnInit {
  public files: File[] = [];
  public source: string;

  constructor(
    public dialogRef: MatDialogRef<UploadContractDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private storage: Storage,
  ) { }

  ngOnInit() {
    getDownloadURL(ref(this.storage, this.data)).then(res => {
      this.source = res;
      console.log(this.source);
    })
    .catch(error => {
      console.log(error);
    });
  }

  public onSelect(event: any):void {
    this.files = [];
    this.files.push(...event.addedFiles);
  }

  public onRemove(event: any):void {
    this.files.splice(this.files.indexOf(event), 1);
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
