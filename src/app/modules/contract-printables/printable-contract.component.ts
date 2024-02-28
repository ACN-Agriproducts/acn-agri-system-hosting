import { Component, Directive, ElementRef, HostBinding, Input, OnInit, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { ContractSettings } from '@shared/classes/contract-settings';
import { Company } from '@shared/classes/company';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Firestore } from '@angular/fire/firestore';
import { TypeTemplateDirective } from '@core/directive/type-template/type-template.directive';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';

@Component({
  selector: 'app-printable-contract',
  templateUrl: './printable-contract.component.html',
  styleUrls: ['./printable-contract.component.scss'],
})
export class PrintableContractComponent implements OnInit {
  @ViewChildren(TypeTemplateDirective) private versionTemplates: QueryList<TypeTemplateDirective>;

  @Input("version") set version(newVersion: string) {
    this.version$.next(newVersion);
  }
  @Input() contract: Contract;
  @Input() focusedField: string;
  
  // @Output() contractTypesListEmitter = new EventEmitter<Map<string, string>>();

  public version$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public template$: Observable<TemplateRef<any>> = this.version$.pipe(
    filter(() => !!this.versionTemplates),
    map(version => this.versionTemplates.find(template => template.typeTemplate === (version ?? this.contract.type))?.templateRef)
  );
  
  public settings: ContractSettings;
  public company: Promise<Company>;

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    ContractSettings.getContractDoc(this.contract).then(result => {
      this.settings = result;
      // this.contractTypesListEmitter.emit(new Map(Object.entries(result.contractTypes)));
    });

    this.company = Company.getCompany(this.db, this.session.getCompany());
  }

  ngAfterViewInit() {
    this.version$.next(this.version$.getValue());
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