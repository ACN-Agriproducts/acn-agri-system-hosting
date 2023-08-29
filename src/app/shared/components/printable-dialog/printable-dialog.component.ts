import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-printable-dialog',
  templateUrl: './printable-dialog.component.html',
  styleUrls: ['./printable-dialog.component.scss'],
})
export class PrintableDialogComponent implements OnInit {
  @Input() printStyle: any;

  constructor(
    // public dialogRef: MatDialogRef<PrintableDialogComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {}

}
