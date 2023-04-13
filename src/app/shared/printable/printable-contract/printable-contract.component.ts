import { Component, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { doc, Firestore, getDoc, getDocFromServer } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Company } from '@shared/classes/company';
import { Contract } from '@shared/classes/contract';
import { TypeTemplateDirective } from '@core/directive/type-template/type-template.directive';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

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

  @Output() contractTypesListEmitter = new EventEmitter<Map<string, string>>();

  public version$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public template$: Observable<TemplateRef<any>> = this.version$.pipe(
    filter(() => !!this.versionTemplates),
    map(version => this.versionTemplates.find(template => template.typeTemplate === (version ?? this.contract.type))?.templateRef)
  );

  constructor(
    private db: Firestore,
    private session: SessionInfo
  ) { }

  ngOnInit() {
    const settingsRef = doc(
      Company.getCompanyRef(this.db, this.session.getCompany()),
      'settings/contracts'
    );

    getDocFromServer(settingsRef).then(snap => {
      const typesObject = snap.data().contractTypes;
      this.contractTypesListEmitter.emit(new Map(Object.entries(typesObject)));
    });
  }

  ngAfterViewInit() {
    this.version$.next(this.version$.getValue());
  }

}