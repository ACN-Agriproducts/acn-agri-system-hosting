import { ContractModalComponent } from './components/contract-modal/contract-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.page.html',
  styleUrls: ['./contracts.page.scss'],
})
export class ContractsPage implements OnInit {

  constructor(
    private modal: MatDialog
  ) { }

  ngOnInit() {
  }

  public openModal = () => {
    this.modal.open(ContractModalComponent, {
      autoFocus: false
    });
  }
}
