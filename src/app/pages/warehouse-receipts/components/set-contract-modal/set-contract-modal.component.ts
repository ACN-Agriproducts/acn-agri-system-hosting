import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-set-contract-modal',
  templateUrl: './set-contract-modal.component.html',
  styleUrls: ['./set-contract-modal.component.scss'],
})
export class SetContractModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SetContractModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ContractData
  ) { }

  ngOnInit() {
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

interface ContractData {
  basePrice?: number;
  futurePrice?: number;
  id?: string;
  pdfReference?: string;
  startDate: Date;
  status?: string;
}
