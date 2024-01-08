import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Storage, deleteObject, getDownloadURL, getMetadata, ref, uploadBytes } from '@angular/fire/storage';
import { FileStorageInfo } from '@shared/classes/liquidation';
import { TranslocoService } from '@ngneat/transloco';

type DropFileStorageInfo = FileStorageInfo & { 
  url: SafeResourceUrl, 
  dropfile: File,
  contentType: string;
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
    .then(async res => {
      // console.log(res)
      file.contentType = (await getMetadata(ref(this.storage, file.ref))).contentType;
      file.url = this.sanitizer.bypassSecurityTrustResourceUrl(res);
      // console.log(file.url)
      if (file.url == null) throw `The resource "${file.name}" could not be secured for use.`;
    })
    .catch(e => {
      console.error(e);
      this.snack.open(e, 'error');
    });
  }

  public onSelect(event: any, file: DropFileStorageInfo): void {
    file.dropfile = event.addedFiles[0];
    this.readFileUrl(file);
  }

  public onRemove(file: DropFileStorageInfo): void {
    file.dropfile = file.url = null;
  }

  public confirm(): void {
    this.startingFiles.forEach(file => {
      if (!this.data.files.includes(file)) {
        deleteObject(ref(this.storage, file.ref));
      }
    });

    this.dialogRef.close(this.data.files.map(file => {
      if (file.dropfile) {
        this.uploadDocument(file);
      }
      return {
        ref: file.ref,
        name: file.name,
      }
    }));
  }

  public async uploadDocument(file: DropFileStorageInfo) {
    uploadBytes(ref(this.storage, file.ref), file.dropfile)
    .then(uploadRef => {
      file.ref = uploadRef.ref.fullPath;
    })
    .catch(error => {
      this.snack.open(error, 'error');
    });
  }

  public addDocument() {
    this.data.files.push({
      name: `document (${++this.count})`,
      ref: `${this.data.locationRef}/document${this.count}`,
      url: null,
      dropfile: null,
      contentType: null
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
    return this.data.files.some(file => !(file.dropfile || file.url));
  }

  public readFileUrl(file: DropFileStorageInfo) {
    this.reader.onload = async () => {
      file.contentType = file.dropfile.type;
      file.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.reader.result as string);
    }
    this.reader.readAsDataURL(file.dropfile);
  }

  public checkIfMsDoc(type: string) {
    return type?.replace("application/", "").startsWith("vnd.openxmlformats-officedocument");
  }

  // public async getUrlData(file: DropFileStorageInfo, rawUrl: string) {
  //   file.contentType = (await getMetadata(ref(this.storage, file.ref))).contentType;
  //   if (this.checkIfMsDoc(file.contentType)) {
  //     file.url = this.sanitizer.bypassSecurityTrustResourceUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURI(rawUrl)}`);
  //   }
  //   else {
  //     file.url = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  //   }
  // }

}
