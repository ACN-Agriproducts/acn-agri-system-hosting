import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Storage, deleteObject, getDownloadURL, getMetadata, ref, uploadBytes } from '@angular/fire/storage';
import { TranslocoService } from '@ngneat/transloco';

export interface FileStorageInfo {
  name: string;
  ref: string;
  contentType: string;
}

type DropFileStorageInfo = FileStorageInfo & { 
  url: SafeResourceUrl, 
  dropfile: File,
  contentType: string;
};

export interface DialogUploadData {
  docType: string;
  locationRef: string;
  readonly files: FileStorageInfo[];
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
  public count: number = this.data.files.length ?? 0;
  public fileName: string;
  public filesForUpload: DropFileStorageInfo[] = [];

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
      this.snack.openTranslated("The reference/path to the document does not exist.", 'error');
      return;
    }

    this.filesForUpload = this.data.files.map(file => {
      const newFile = { ...file, url: null, dropfile: null, contentType: null };
      this.getDocumentUrl(newFile);
      return newFile;
    });

    this.startingFiles = [...this.filesForUpload];
    this.fileName = this.data.docType.toLocaleLowerCase().replace(/\s+/g, "-");

    if (this.filesForUpload.length <= 0 && this.data.uploadable) this.addDocument();
  }

  ngOnDestroy() {
    delete this.reader;
  }

  public getDocumentUrl(file: DropFileStorageInfo) {
    getDownloadURL(ref(this.storage, file.ref))
    .then(async res => {
      file.contentType = (await getMetadata(ref(this.storage, file.ref))).contentType;
      file.url = this.sanitizer.bypassSecurityTrustResourceUrl(res);
      if (file.url == null) throw `The resource could not be secured for use.`;
    })
    .catch(e => {
      console.error(e);
      this.snack.openTranslated(`The resource could not be secured for use.`, 'error');
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
      if (!this.filesForUpload.includes(file)) {
        deleteObject(ref(this.storage, file.ref));
      }
    });

    this.dialogRef.close(this.filesForUpload.map(file => {
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
      console.error(error);
      this.snack.openTranslated("Could not upload the file(s).", 'error');
    });
  }

  public addDocument() {
    this.filesForUpload.push({
      name: `document (${++this.count})`,
      ref: `${this.data.locationRef}/document${this.count}`,
      url: null,
      dropfile: null,
      contentType: null
    });
    this.selected = this.filesForUpload.length - 1;
  }

  public async removeDocument(index: number) {
    this.filesForUpload.splice(index, 1);
    if (this.selected === this.filesForUpload.length) {
      this.selected -= 1;
    }
  }

  public checkFiles() {
    return this.filesForUpload.some(file => !(file.dropfile || file.url));
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
