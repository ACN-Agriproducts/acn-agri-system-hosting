import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-printable-dialog',
  templateUrl: './printable-dialog.component.html',
  styleUrls: ['./printable-dialog.component.scss'],
})
export class PrintableDialogComponent implements OnInit {
  @Input() printStyle: {
    [key: string]: {
      [key: string]: string;
    }
  };

  constructor() {}

  ngOnInit() {}

}
