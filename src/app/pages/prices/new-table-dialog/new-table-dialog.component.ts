import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-new-table-dialog',
  templateUrl: './new-table-dialog.component.html',
  styleUrls: ['./new-table-dialog.component.scss'],
})
export class NewTableDialogComponent implements OnInit {
  public returnData: {
    name: string;
    baseTable: string;
  }

  constructor(
    public dialogRef: MatDialogRef<NewTableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public names: string[]
  ) { }

  ngOnInit() {
    this.returnData = {
      name: "",
      baseTable: ""
    }
  }

  accept() {
    this.dialogRef.close(this.returnData);
  }

  validName(): boolean {
    return this.names.every(n => n != this.returnData.name);
  } 
}