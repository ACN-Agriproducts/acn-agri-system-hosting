import { Component, Inject, OnInit } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';

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
    private snack: SnackbarService,
    private storage: Storage,
  ) { }

  ngOnInit() {
    this.contractType = this.data.status === 'PENDING' ? 'Sales Contract' : 'Purchase Contract';
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
      console.error(error);
      this.snack.openTranslated("Error while uploading contract.", 'error');
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
}

export interface ContractData {
  basePrice?: number;
  futurePrice?: number;
  id?: string;
  pdfReference?: string;
  startDate: Date;
  status: string;
  contractRef?: string;
}
