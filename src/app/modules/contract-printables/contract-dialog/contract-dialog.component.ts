import { Component, Input, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'app-contract-dialog',
  templateUrl: './contract-dialog.component.html',
  styleUrls: ['./contract-dialog.component.scss'],
})
export class ContractDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Contract
  ) {}

  ngOnInit() {}

}