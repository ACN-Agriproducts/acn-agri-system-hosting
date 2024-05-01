import { Component, Inject, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-view-contract-dialog',
  templateUrl: './view-contract-dialog.component.html',
  styleUrls: ['./view-contract-dialog.component.scss'],
})
export class ViewContractDialogComponent implements OnInit {
  public ready: boolean = false;
  public source: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViewContractDialogComponent>,
    private sanitizer: DomSanitizer,
    private snack: SnackbarService,
    private storage: Storage,
  ) { }

  ngOnInit() {
    this.data.contractRef = this.data.contractRef ?? '';
    if (this.data.contractRef.length === 0) {
      this.snack.openTranslated("The reference/path to the document does not exist.", 'error');
      return;
    }

    getDownloadURL(ref(this.storage, this.data.contractRef))
    .then(res => {
      this.source = this.sanitizer.bypassSecurityTrustResourceUrl(res) ?? null;
      this.ready = this.source !== null;
      if (!this.ready) throw "The resource could not be secured for use.";
    })
    .catch(error => {
      console.error(error);
      this.snack.openTranslated("The resource could not be secured for use.", 'error');
    });
  }

  public close(): void {
    this.dialogRef.close();
  }
}
