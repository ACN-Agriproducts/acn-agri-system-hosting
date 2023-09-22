import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { FileStorageInfo } from '@shared/classes/liquidation';
import { TranslocoService } from '@ngneat/transloco';

type DropFileStorageInfo = FileStorageInfo & { dropFile: File };

export interface DialogUploadData {
  docType: string;
  files: DropFileStorageInfo[];
  uploadable: boolean;
  locationRef: string;
}

@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss'],
})
export class DocumentUploadDialogComponent implements OnInit {
  public fileNamePrefix: string;
  public selected: number = 0;
  public reader: FileReader = new FileReader();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogUploadData,
    private dialogRef: MatDialogRef<DocumentUploadDialogComponent>,
    private sanitizer: DomSanitizer,
    private snack: SnackbarService,
    private storage: Storage,
    private transloco: TranslocoService
  ) { }

  ngOnInit() {
    if (!this.data.locationRef) {
      this.snack.open("The reference/path to the document does not exist.", 'error');
      return;
    }

    this.fileNamePrefix = this.data.docType.toLocaleLowerCase().replace(/\s+/g, "-");
    this.data.files.forEach(file => this.getDocumentUrl(file));

    if (this.data.files.length <= 0) this.addDocument();
  }

  ngOnDestroy() {
    delete this.reader;
  }

  public getDocumentUrl(file: DropFileStorageInfo) {
    getDownloadURL(ref(this.storage, file.ref))
    .then(res => {
      file.source = this.sanitizer.bypassSecurityTrustResourceUrl(res) ?? null;
      if (file.source == null) throw `The resource "${file.name}" could not be secured for use.`;
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });
  }

  public onSelect(event: any, file: DropFileStorageInfo): void {
    file.dropFile = event.addedFiles[0];
    this.loadSource(file);
  }

  public onRemove(file: DropFileStorageInfo): void {
    file.dropFile = file.source = null;
  }

  public confirm(): void {
    this.dialogRef.close(this.data.files.map(file => {
      this.uploadDocument(file);
      return {
        ref: file.ref,
        name: file.name,
        source: file.source
      }
    }));
  }

  public uploadDocument(file: DropFileStorageInfo) {
    uploadBytes(ref(this.storage, file.ref), file.dropFile)
    .then(uploadRef => {
      // console.log(uploadRef.ref.fullPath)
      file.ref = uploadRef.ref.fullPath;
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });
  }

  public addDocument() {
    const count = this.data.files.length + 1;

    this.data.files.push({
      name: `${this.data.docType} (${this.transloco.translate("contracts.table.New")})`,
      ref: this.data.locationRef + this.fileNamePrefix + count,
      source: null,
      dropFile: null
    });
    this.selected = this.data.files.length;
  }

  public removeDocument(index: number) {
    this.data.files.splice(index, 1);
  }

  public checkFiles() {
    return this.data.files.some(file => !(file.dropFile || file.source));
  }

  // DON'T FORGET THE WATERMARK FOR THE DIALOG

  // WORK ON DISPLAYING THE ALREADY SAVED DOCUMENTS IN THE LIQUIDATION

  public loadSource(file: DropFileStorageInfo) {
    this.reader.onload = () => {
      file.source = this.sanitizer.bypassSecurityTrustResourceUrl(this.reader.result as string);
    }
    this.reader.readAsDataURL(file.dropFile);
  }

  public checkIfMsDoc(type: string) {
    return type.replace("application/", "").startsWith("vnd.openxmlformats-officedocument");
  }

  public changeName(file: DropFileStorageInfo, name: string) {
    file.name = name;
    file.ref = this.data.locationRef + name.replace(/\s+/g, "-");
  }

}
