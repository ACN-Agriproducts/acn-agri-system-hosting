import { Component, Inject, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-preview-contract-dialog',
  templateUrl: './preview-contract-dialog.component.html',
  styleUrls: ['./preview-contract-dialog.component.scss'],
})
export class PreviewContractDialogComponent implements OnInit {
  public files: File[] = [];
  public source: SafeResourceUrl;

  constructor(
    public dialogRef: MatDialogRef<PreviewContractDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private storage: Storage,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    getDownloadURL(ref(this.storage, this.data)).then(res => {
      this.source = this.sanitizer.bypassSecurityTrustResourceUrl(res);
    })
    .then(() => {
      console.log(this.source);
    })
    .catch(error => {
      console.log(error);
    });
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
