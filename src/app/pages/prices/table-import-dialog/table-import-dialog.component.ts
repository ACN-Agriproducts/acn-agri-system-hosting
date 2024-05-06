import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-table-import-dialog',
  templateUrl: './table-import-dialog.component.html',
  styleUrls: ['./table-import-dialog.component.scss'],
})
export class TableImportDialogComponent implements OnInit {
  public input: string;

  constructor(
    public dialogRef: MatDialogRef<TableImportDialogComponent>,
  ) { }

  ngOnInit() {}

  accept() {
    this.dialogRef.close(this.input);
  }
}
