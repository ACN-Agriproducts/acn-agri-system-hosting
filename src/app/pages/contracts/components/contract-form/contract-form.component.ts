import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract } from '@shared/classes/contract';
import { ContractSettings } from '@shared/classes/contract-settings';

@Component({
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
})
export class ContractFormComponent implements OnInit {
  @Input() contract: Contract;
  public settings: ContractSettings;

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    ContractSettings.getDocument(this.db, this.session.getCompany()).then(result => {
      this.settings = result;
    });
  }
}
