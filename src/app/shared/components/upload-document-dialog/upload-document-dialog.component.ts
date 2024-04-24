import { Component, Inject, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';

export interface UploadDialogData {
  docType: string;
  hasDoc: boolean;
  pdfRef: string;
  uploadable: boolean;
}

@Component({
  selector: 'app-upload-document-dialog',
  templateUrl: './upload-document-dialog.component.html',
  styleUrls: ['./upload-document-dialog.component.scss'],
})
export class UploadDocumentDialogComponent implements OnInit {
  public files: File[] = [];
  public source: SafeResourceUrl;
  public ready: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UploadDialogData,
    private dialogRef: MatDialogRef<UploadDocumentDialogComponent>,
    private sanitizer: DomSanitizer,
    private snack: SnackbarService,
    private storage: Storage,
  ) { }

  ngOnInit() {
    if (this.data.pdfRef == null) {
      this.snack.open("The reference/path to the document does not exist.", 'error');
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
      console.error(error);
      this.snack.open("The resource could not be secured for use.", 'error');
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
      console.error(error);
      this.snack.open("Could not upload the files.", 'error');
    });
  }
}
