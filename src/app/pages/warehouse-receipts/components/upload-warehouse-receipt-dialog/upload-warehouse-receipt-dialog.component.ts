import { Component, Inject, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-upload-warehouse-receipt-dialog',
  templateUrl: './upload-warehouse-receipt-dialog.component.html',
  styleUrls: ['./upload-warehouse-receipt-dialog.component.scss'],
})
export class UploadWarehouseReceiptDialogComponent implements OnInit {
  public files: File[] = [];
  public source: SafeResourceUrl;
  public ready: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UploadWarehouseReceiptDialogComponent>,
    private sanitizer: DomSanitizer,
    private storage: Storage,
    private snack: SnackbarService,
  ) { }

  ngOnInit() {
    if (this.data.pdfRef == null) {
      this.snack.openSnackbar("The reference/path to the warehouse receipt document does not exist.", 'error');
      return;
    }
    if (!this.data.hasDoc) {
      return;
    }

    getDownloadURL(ref(this.storage, this.data.pdfRef))
    .then(res => {
      this.source = this.sanitizer.bypassSecurityTrustResourceUrl(res) ?? null;
      this.ready = this.source !== null;
      if (!this.ready) throw "The resource could not be secured for use.";
    })
    .catch(error => {
      this.snack.openSnackbar(error, 'error');
    });
  }

  public onSelect(event: any):void {
    this.files = event.addedFiles;
  }

  public onRemove(event: any):void {
    this.files.splice(this.files.indexOf(event), 1);
  }

  public confirm(): void {
    if (this.files.length === 0) {
      this.dialogRef.close(null);
      return;
    }

    uploadBytes(ref(this.storage, this.data.pdfRef), this.files[0])
    .then(async () => {
      this.dialogRef.close(ref(this.storage, this.data.pdfRef).fullPath);
    })
    .catch(error => {
      this.snack.openSnackbar(error, 'error');
    });
  }
}
