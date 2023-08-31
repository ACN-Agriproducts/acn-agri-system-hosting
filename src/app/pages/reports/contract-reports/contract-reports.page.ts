import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { WeekRangeSelectionStrategy } from '@pages/inventory/storage-logs/storage-logs.page';
import { ContractSettings } from '@shared/classes/contract-settings';

@Component({
  selector: 'app-contract-reports',
  templateUrl: './contract-reports.page.html',
  styleUrls: ['./contract-reports.page.scss'],
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: WeekRangeSelectionStrategy
    }
  ]
})
export class ContractReportsPage implements OnInit {
  contractSettings: Promise<ContractSettings>;
  startDate: Date;
  endDate: Date;

  selectedContractTypes: string[];

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    this.contractSettings = ContractSettings.getDocument(this.db, this.session.getCompany());

    this.selectedContractTypes = [];
  }

}
