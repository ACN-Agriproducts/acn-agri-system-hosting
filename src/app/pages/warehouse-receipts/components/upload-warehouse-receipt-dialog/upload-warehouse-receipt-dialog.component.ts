import { Component, Inject, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-upload-warehouse-receipt-dialog',
  templateUrl: './upload-warehouse-receipt-dialog.component.html',
  styleUrls: ['./upload-warehouse-receipt-dialog.component.scss'],
})
export class UploadWarehouseReceiptDialogComponent implements OnInit {
  public files: File[] = [];
  public status: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UploadWarehouseReceiptDialogComponent>,
    private sanitizer: DomSanitizer,
    private storage: Storage,
  ) { }

  ngOnInit() {
    
  }

  public onSelect(event: any):void {
    this.files = [];
    this.files.push(...event.addedFiles);
  }

  public onRemove(event: any):void {
    this.files.splice(this.files.indexOf(event), 1);
  }

  public confirm(): void {
    if (this.files.length === 0) {
      this.dialogRef.close(null);
      return;
    }

    uploadBytes(ref(this.storage, this.data), this.files[0])
    .then(async () => {
      this.dialogRef.close(await getDownloadURL(ref(this.storage, this.data)));
    })
    .catch(error => {
      console.log(error);
    });
  }
}
