import { Component, OnInit, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-move-inv-dialog',
  templateUrl: './move-inv-dialog.component.html',
  styleUrls: ['./move-inv-dialog.component.scss'],
})
export class MoveInvDialogComponent implements OnInit {
  public response: any = {
    targetTank: null,
    quantityToMove: null,
    wholeInventory: false,
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    tankList: any[],
    currentTank: number
  }) {}

  ngOnInit() {}

}
