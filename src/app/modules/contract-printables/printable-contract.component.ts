import { Component, Directive, ElementRef, HostBinding, Input, OnInit, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { ContractSettings } from '@shared/classes/contract-settings';
import { Company } from '@shared/classes/company';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-printable-contract',
  templateUrl: './printable-contract.component.html',
  styleUrls: ['./printable-contract.component.scss'],
})
export class PrintableContractComponent implements OnInit {
  @Input() contract: Contract;
  @Input() focusedField: string;
  @Input() version: string;
  
  public settings: ContractSettings;
  public company: Promise<Company>;

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    ContractSettings.getContractDoc(this.contract).then(result => {
      this.settings = result;
    });

    this.company = Company.getCompany(this.db, this.session.getCompany());
  }

}

@Directive({
  selector: '[printableField]'
})
export class FocusedFieldDirective {
  @Input('printableField') fieldName: string;
  isFocused: boolean = false;

  @HostBinding('class.focused')
  get function() {
    return this.isFocused;
  }

  constructor(public el: ElementRef) {}
}