import { Component, Inject, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
    private snackbar: MatSnackBar,
    private storage: Storage,
  ) { }

  ngOnInit() {
    this.data.contractRef = this.data.contractRef ?? '';
    if (this.data.contractRef.length === 0) {
      this.openSnackbar("The reference/path to the contract does not exist.", true);
      return;
    }

    getDownloadURL(ref(this.storage, this.data.contractRef))
    .then(res => {
      this.source = this.sanitizer.bypassSecurityTrustResourceUrl(res) ?? null;
      this.ready = this.source !== null;
      if (!this.ready) throw "The resource could not secured for use.";
    })
    .catch(error => {
      this.openSnackbar(error, true);
    });
  }

  public close(): void {
    this.dialogRef.close();
  }

  public openSnackbar (message: string, error?: boolean): void {
    if (error) {
      this.snackbar.open(message, "Close", { duration: 5000, panelClass: 'snackbar-error' });
      return;
    }
    this.snackbar.open(message, "", { duration: 1500, panelClass: 'snackbar' });
  }
}
