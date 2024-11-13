import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-photo-dialog',
  templateUrl: './photo-dialog.component.html',
  styleUrls: ['./photo-dialog.component.scss'],
})
export class PhotoDialogComponent implements OnInit {
  public photoIndex: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { photos: string[], index: number}
  ) { }

  ngOnInit() {
    this.photoIndex = this.data.index;
  }

  previousPhoto() {
    if (this.photoIndex > 0) this.photoIndex--;
  }

  nextPhoto() {
    if (this.photoIndex < this.data.photos.length - 1) this.photoIndex++;
  }

}
