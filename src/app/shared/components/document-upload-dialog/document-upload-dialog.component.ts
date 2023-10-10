import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Storage, deleteObject, getBytes, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { FileStorageInfo } from '@shared/classes/liquidation';
import { TranslocoService } from '@ngneat/transloco';

type DropFileStorageInfo = FileStorageInfo & { 
  url: SafeResourceUrl, 
  dropFile: File,
  new: boolean
};

export interface DialogUploadData {
  docType: string;
  locationRef: string;
  readonly files: DropFileStorageInfo[];
  uploadable: boolean;
}

@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss'],
})
export class DocumentUploadDialogComponent implements OnInit {
  public selected: number = 0;
  public reader: FileReader = new FileReader();
  public startingFiles: DropFileStorageInfo[] = [];
  public count: number = this.data.files.length;
  public fileName: string;

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

    this.data.files.forEach(file => this.getDocumentUrl(file));
    this.startingFiles = [...this.data.files];
    this.fileName = this.data.docType.toLocaleLowerCase().replace(/\s+/g, "-");

    if (this.data.files.length <= 0 && this.data.uploadable) this.addDocument();
  }

  ngOnDestroy() {
    delete this.reader;
  }

  public getDocumentUrl(file: DropFileStorageInfo) {
    getDownloadURL(ref(this.storage, file.ref))
    .then(res => {
      file.url = this.sanitizer.bypassSecurityTrustResourceUrl(res) ?? null;
      if (file.url == null) throw `The resource "${file.name}" could not be secured for use.`;
    })
    .catch(e => {
      console.error(e);
      this.snack.open(e, 'error');
    });
  }

  public onSelect(event: any, file: DropFileStorageInfo): void {
    file.dropFile = event.addedFiles[0];
    this.loadUrl(file);
  }

  public onRemove(file: DropFileStorageInfo): void {
    file.dropFile = file.url = null;
  }

  public confirm(): void {
    this.startingFiles.forEach(file => {
      if (!this.data.files.includes(file)) {
        deleteObject(ref(this.storage, file.ref));
      }
    });

    this.dialogRef.close(this.data.files.map(file => {
      if (file.dropFile) {
        this.uploadDocument(file);
      }
      return {
        ref: file.ref,
        name: file.name,
      }
    }));
  }

  public async uploadDocument(file: DropFileStorageInfo) {
    uploadBytes(ref(this.storage, file.ref), file.dropFile)
    .then(uploadRef => {
      file.ref = uploadRef.ref.fullPath;
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });
  }

  public addDocument() {
    const name = this.transloco.translate('contracts.info.document');
    this.data.files.push({
      // name: `${this.fileName} (${++this.count})`,
      name: `${name} (${++this.count})`,
      // ref: `${this.data.locationRef}/${this.fileName}(${this.count})`,
      ref: `${this.data.locationRef}/${name}${this.count}`,
      url: null,
      dropFile: null,
      new: true
    });
    this.selected = this.data.files.length - 1;
  }

  public async removeDocument(index: number) {
    this.data.files.splice(index, 1);
    if (this.selected === this.data.files.length) {
      this.selected -= 1;
    }
  }

  public checkFiles() {
    return this.data.files.some(file => !(file.dropFile || file.url));
  }

  public loadUrl(file: DropFileStorageInfo) {
    this.reader.onload = () => {
      file.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.reader.result as string);
    }
    this.reader.readAsDataURL(file.dropFile);
  }

  public checkIfMsDoc(type: string) {
    return type.replace("application/", "").startsWith("vnd.openxmlformats-officedocument");
  }

  public changeName(file: DropFileStorageInfo, name: string) {
    file.name = name;
    // file.ref = `${this.data.locationRef}/${name.replace(/\s+/g, "-")}`;
  }

}
