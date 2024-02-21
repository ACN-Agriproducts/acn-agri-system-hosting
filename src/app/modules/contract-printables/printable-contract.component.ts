import { Component, Directive, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { TypeTemplateDirective } from '@core/directive/type-template/type-template.directive';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
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
  @ViewChildren(TypeTemplateDirective) private versionTemplates: QueryList<TypeTemplateDirective>;

  @Input("version") set version(newVersion: string) {
    this.version$.next(newVersion);
  }
  @Input() contract: Contract;
  @Input() focusedField: string;

  @Input() templateVersion: string;
  public company: Promise<Company>;

  // @Output() contractTypesListEmitter = new EventEmitter<Map<string, string>>();

  public version$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public template$: Observable<TemplateRef<any>> = this.version$.pipe(
    filter(() => !!this.versionTemplates),
    map(version => this.versionTemplates.find(template => template.typeTemplate === (version ?? this.contract.type))?.templateRef)
  );

  public settings: ContractSettings;

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