import { Component, Input, OnInit, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Contract } from '@shared/classes/contract';
import { ContractSettings } from '@shared/classes/contract-settings';
import { TypeTemplateDirective } from '@shared/directives/type-template/type-template.directive';

@Component({
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss'],
})
export class ContractFormComponent implements OnInit {
  @Input() contract: Contract;
  public settings: ContractSettings;

  @ViewChildren(TypeTemplateDirective) public versionTemplates: QueryList<TemplateRef<any>>;

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
