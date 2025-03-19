import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoadOrder } from '@shared/classes/load-orders.model';

@Component({
  selector: 'app-load-order-dialog',
  templateUrl: './load-order-dialog.component.html',
  styleUrls: ['./load-order-dialog.component.scss'],
})
export class LoadOrderDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: LoadOrder
  ) {}

  ngOnInit() {}

}
