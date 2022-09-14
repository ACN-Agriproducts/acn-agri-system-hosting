import { Component, Inject, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-upload-signed-contract',
  templateUrl: './upload-signed-contract.component.html',
  styleUrls: ['./upload-signed-contract.component.scss'],
})
export class UploadSignedContractComponent implements OnInit {
  public files: File[] = [];
  public source: SafeResourceUrl;
  public ready: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<UploadSignedContractComponent>,
    private sanitizer: DomSanitizer,
    private storage: Storage,
  ) { }

  ngOnInit() {
    if (this.data.pdfRef == null) {
      console.log("The reference/path to the document does not exist.");
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
      console.log(error);
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
      console.log(error);
    });
  }
}
