import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { PhotoDialogComponent } from '../photo-dialog/photo-dialog.component';

@Component({
  selector: 'app-app-photos',
  templateUrl: './app-photos.component.html',
  styleUrls: ['./app-photos.component.scss'],
})
export class AppPhotosComponent implements OnInit {
  // data = inject(MAT_DIALOG_DATA);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { photos: string[], id: number, plates: string },
    private dialog: MatDialog
  ) { }

  ngOnInit() {}

  viewPhoto(index: number) {
    this.dialog.open(PhotoDialogComponent, {
      data: { photos: this.data.photos, index },
      maxWidth: "1000px"
    });
  }

}
