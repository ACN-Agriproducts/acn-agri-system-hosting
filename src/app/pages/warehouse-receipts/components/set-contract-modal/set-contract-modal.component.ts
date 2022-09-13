import { Component, Inject, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-set-contract-modal',
  templateUrl: './set-contract-modal.component.html',
  styleUrls: ['./set-contract-modal.component.scss'],
})
export class SetContractModalComponent implements OnInit {
  public files: File[] = [];
  public contractType: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ContractData,
    private dialogRef: MatDialogRef<SetContractModalComponent>,
    private snackbar: MatSnackBar,
    private storage: Storage,
  ) { }

  ngOnInit() {
    this.contractType = this.data.status === 'PENDING' ? 'Sale' : 'Purchase';
  }

  public onSelect(event: any):void {
    this.files = event.addedFiles;
  }

  public onRemove(event: any):void {
    this.files.splice(this.files.indexOf(event), 1);
  }

  public cancel(): void {
    this.dialogRef.close(null);
  }

  public confirm(): void {
    if (this.files.length === 0) {
      this.dialogRef.close(this.data);
      return;
    }

    uploadBytes(ref(this.storage, this.data.contractRef), this.files[0])
    .then(async () => {
      this.data.pdfReference = await getDownloadURL(ref(this.storage, this.data.contractRef));
      this.dialogRef.close(this.data);
    })
    .catch(error => {
      this.openSnackbar(error, true);
    });
  }

  public shortUrl(): string {
    const url = this.data.pdfReference;
    const len = url.length;
    if (len > 30) {
      return url.substring(0, 21) + " .... " + url.substring(len - 9, len);
    }
    return url;
  }

  public openSnackbar (message: string, error?: boolean): void {
    if (error) {
      this.snackbar.open(message, "Close", { duration: 5000, panelClass: 'snackbar-error' });
      return;
    }
    this.snackbar.open(message, "", { duration: 1500, panelClass: 'snackbar' });
  }
}

interface ContractData {
  basePrice?: number;
  futurePrice?: number;
  id?: string;
  pdfReference?: string;
  startDate: Date;
  status: string;
  contractRef?: string;
}
