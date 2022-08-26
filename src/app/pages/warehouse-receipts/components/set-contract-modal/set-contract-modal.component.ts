import { Component, Inject, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { url } from 'inspector';

@Component({
  selector: 'app-set-contract-modal',
  templateUrl: './set-contract-modal.component.html',
  styleUrls: ['./set-contract-modal.component.scss'],
})
export class SetContractModalComponent implements OnInit {
  public files: File[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ContractData,
    private dialogRef: MatDialogRef<SetContractModalComponent>,
    private snackbar: MatSnackBar,
    private storage: Storage,
  ) { }

  ngOnInit() { }

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

  public confirm(): void {
    getDownloadURL(ref(this.storage, this.data.contractRef)).then(res => {
      this.data.pdfReference = res;
    });

    uploadBytes(ref(this.storage, this.data.contractRef), this.files[0])
    .then(async res => {
      console.log(res);

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
      this.snackbar.open(message, "Close", { duration: 4000, panelClass: 'snackbar-error' });
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
