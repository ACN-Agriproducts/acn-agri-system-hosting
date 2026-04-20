import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-zero-out-tank-dialog',
  templateUrl: './zero-out-tank-dialog.component.html',
  styleUrls: ['./zero-out-tank-dialog.component.scss'],
})
export class ZeroOutTankDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    tankName: string
  }) { }

  ngOnInit() {}

}
