import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NavController } from '@ionic/angular';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'app-contracts-table',
  templateUrl: './contracts-table.component.html',
  styleUrls: ['./contracts-table.component.scss'],
})
export class ContractsTableComponent implements OnInit {
  @Input() contracts: Contract[];
  @Input() dialogRef: MatDialogRef<any>

  constructor(
    private navController: NavController
  ) { }

  ngOnInit() {}

  public openContract(contract: Contract) {
    this.navController.navigateForward(`dashboard/contracts/contract-info/${contract.type}/${contract.ref.id}`);
    this.dialogRef?.close();
  }
}
