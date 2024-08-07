import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contract } from '@shared/classes/contract';
import { ClientAccount } from '../../contract-payment-reports.page';

@Component({
  selector: 'app-client-dialog',
  templateUrl: './client-dialog.component.html',
  styleUrls: ['./client-dialog.component.scss'],
})
export class ClientDialogComponent implements OnInit {
  purchaseContracts: Contract[];
  saleContracts: Contract[];
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ClientAccount,
    public dialogRef: MatDialogRef<ClientDialogComponent>
  ) { }

  ngOnInit() {
    this.purchaseContracts = this.data.contracts.filter(c => c.tags.includes('purchase'));
    this.saleContracts = this.data.contracts.filter(c => c.tags.includes('sale'));
  }
}
