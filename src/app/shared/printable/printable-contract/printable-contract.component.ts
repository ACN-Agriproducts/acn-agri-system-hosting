import { Component, Input, OnInit, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { TypeTemplateDirective } from '@shared/directives/type-template/type-template.directive';
import { BehaviorSubject, filter, map } from 'rxjs';

@Component({
  selector: 'app-printable-contract',
  templateUrl: './printable-contract.component.html',
  styleUrls: ['./printable-contract.component.scss'],
})
export class PrintableContractComponent implements OnInit {
  @Input("version") set version(newVersion: string) {
    this.version$.next(newVersion);
  }

  @ViewChildren(TypeTemplateDirective) private versionTemplates: QueryList<TypeTemplateDirective>;

  version$ = new BehaviorSubject<string>(null);
  template$ = this.version$.pipe(
    filter(() => !!this.versionTemplates),
    map(version => this.versionTemplates.find(template => template.typeTemplate === version)?.templateRef)
  );

  constructor() { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.version$.next(this.version$.getValue());
    this.template$.subscribe(val => console.log(val))
  }

}
