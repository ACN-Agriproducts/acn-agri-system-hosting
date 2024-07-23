import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompanyService } from '@core/services/company/company.service';
import { CompanyContact } from '@shared/classes/company';
import { Contract } from '@shared/classes/contract';
import { LoadOrder } from '@shared/classes/load-orders.model';

@Component({
  selector: 'app-set-order-modal',
  templateUrl: './set-order-modal.component.html',
  styleUrls: ['./set-order-modal.component.scss'],
})
export class SetOrderModalComponent implements OnInit {
  plants: string[];
  activeContracts: Contract[];

  currentTransport: CompanyContact;
  currentContract: Contract;

  constructor(
    @Inject(MAT_DIALOG_DATA) public order: LoadOrder,
    private companyService: CompanyService
  ) { }

  ngOnInit() {
    this.plants = this.companyService.plantsList.map(p => p.ref.id);
  }
}
