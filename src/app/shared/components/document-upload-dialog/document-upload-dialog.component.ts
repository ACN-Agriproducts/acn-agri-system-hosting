import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { SnackbarService } from '@core/services/snackbar/snackbar.service';
import { Storage, deleteObject, getDownloadURL, getMetadata, getStream, ref, uploadBytes } from '@angular/fire/storage';
import { TranslocoService } from '@ngneat/transloco';

export interface FileStorageInfo {
  name: string;
  ref: string;
}

type FileDisplayInfo = FileStorageInfo & { 
  url: SafeResourceUrl;
  dropfile: File;
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
  public oldDisplayFiles: FileDisplayInfo[] = [];
  public count: number = this.data.files.length ?? 0;
  public newDisplayFiles: FileDisplayInfo[] = [];

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

    console.log(this.data.files)

    this.oldDisplayFiles = this.data.files.map(file => {
      const displayFile = this.newDisplayFile(file);
      this.setDisplayFile(displayFile);
      return displayFile;
    });

    this.newDisplayFiles = [...this.oldDisplayFiles];

    if (this.oldDisplayFiles.length <= 0 && this.data.uploadable) this.addDocument();
  }

  ngOnDestroy() {
    delete this.reader;
  }

  public async setDisplayFile(displayFile: FileDisplayInfo): Promise<void> {
    const storageRef = ref(this.storage, displayFile.ref);
    const metadata = await getMetadata(storageRef);
    displayFile.contentType = metadata.contentType;

    getDownloadURL(storageRef)
    .then(async res => {
      const downloadURL = this.sanitizer.bypassSecurityTrustResourceUrl(res);
      if (downloadURL == null) throw `The resource could not be secured for use.`;

      displayFile.url = downloadURL;
    })
    .catch(e => {
      console.error(e);
      this.snack.openTranslated(`Could not retrieve the resource url.`, 'error');
    });
  }

  public onSelect(event: any, displayFile: FileDisplayInfo): void {
    displayFile.dropfile = event.addedFiles[0];
    displayFile.ref = displayFile.ref + this.getExtension(displayFile.dropfile.type);
    this.readFileUrl(displayFile);
  }

  public onRemove(displayFile: FileDisplayInfo): void {
    displayFile.dropfile = null;
    displayFile.url = null;
  }

  public confirm(): void {
    this.deleteOldFiles();
    const newFiles = this.uploadNewFiles();
    this.dialogRef.close(newFiles);
  }

  public deleteOldFiles(): void {
    this.oldDisplayFiles.forEach(displayFile => {
      if (!this.newDisplayFiles.includes(displayFile)) {
        this.deleteFile(displayFile.ref);
      }
    });
  }

  public deleteFile(fileRef: string): void {
    deleteObject(ref(this.storage, fileRef));
  }

  public uploadNewFiles(): FileStorageInfo[] {
    return this.newDisplayFiles.map(displayFile => {
      this.uploadFile(displayFile);
      return {
        ref: displayFile.ref,
        name: displayFile.name,
      }
    })
  }

  public uploadFile(displayFile: FileDisplayInfo): void {
    if (!displayFile.dropfile) return;

    uploadBytes(ref(this.storage, displayFile.ref), displayFile.dropfile)
    .then(res => {
      displayFile.ref = res.ref.fullPath;
      console.log(displayFile)
    })
    .catch(error => {
      console.error(error);
      this.snack.openTranslated("Could not upload the file(s).", 'error');
    });
  }

  public addDocument(): void {
    const newDisplayFile = this.newDisplayFile({
      name: `document (${++this.count})`,
      ref: `${this.data.locationRef}/document${this.count}`,
    });
    this.newDisplayFiles.push(newDisplayFile);
    this.selected = this.newDisplayFiles.length - 1;
  }

  public removeDocument(index: number): void {
    this.newDisplayFiles.splice(index, 1);
    if (this.selected === this.newDisplayFiles.length) {
      this.selected -= 1;
    }
  }

  public checkFiles(): boolean {
    return this.newDisplayFiles.some(file => !(file.dropfile || file.url));
  }

  public readFileUrl(displayFile: FileDisplayInfo): void {
    this.reader.onload = async () => {
      displayFile.contentType = displayFile.dropfile.type;
      displayFile.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.reader.result as string);
    }
    this.reader.readAsDataURL(displayFile.dropfile);
  }

  public checkIfMsDoc(type: string): boolean {
    return type?.replace("application/", "").startsWith("vnd.openxmlformats-officedocument");
  }

  public getExtension(contentType: string): string {
    switch (contentType) {
      case 'image/jpeg': return ".jpg";
      case 'image/png': return ".png";
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return ".docx";
      case 'application/pdf': return ".pdf";
      default: return ".txt";
    }
  }

  public newDisplayFile(file?: FileStorageInfo | FileDisplayInfo): FileDisplayInfo {
    if (!file) file = { ref: null, name: null };
    return {
      url: null,
      dropfile: null,
      contentType: null,
     ...file
    };
  }

  public hasExtension(fileRef: string): boolean {
    const extensionRegex = /\.[0-9a-z]+$/i;
    return extensionRegex.test(fileRef);
  }

  // public async getUrlData(file: FileDisplayInfo, rawUrl: string) {
  //   file.contentType = (await getMetadata(ref(this.storage, file.ref))).contentType;
  //   if (this.checkIfMsDoc(file.contentType)) {
  //     file.url = this.sanitizer.bypassSecurityTrustResourceUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURI(rawUrl)}`);
  //   }
  //   else {
  //     file.url = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  //   }
  // }

}
