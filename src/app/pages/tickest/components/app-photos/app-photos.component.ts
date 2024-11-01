import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-app-photos',
  templateUrl: './app-photos.component.html',
  styleUrls: ['./app-photos.component.scss'],
})
export class AppPhotosComponent implements OnInit {
  // data = inject(MAT_DIALOG_DATA);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string[]
  ) { }

  ngOnInit() {}

}
