import { Component, Input, OnInit, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { TypeTemplateDirective } from '@core/directive/type-template/type-template.directive';
import { Contract } from '@shared/classes/contract';
import { LiquidationTotals } from '@shared/classes/liquidation';
import { ReportTicket } from '@shared/classes/ticket';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';

@Component({
  selector: 'app-printable-liquidation',
  templateUrl: './printable-liquidation.component.html',
  styleUrls: ['./printable-liquidation.component.scss'],
})
export class PrintableLiquidationComponent implements OnInit {
  @ViewChildren(TypeTemplateDirective) private versionTemplates: QueryList<TypeTemplateDirective>;

  @Input("version") set version(newVersion: string) {
    this.version$.next(newVersion);
  }
  @Input() selectedTickets: ReportTicket[];
  @Input() contract: Contract;
  @Input() totals: LiquidationTotals;

  public version$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public template$: Observable<TemplateRef<any>> = this.version$.pipe(
    filter(() => !!this.versionTemplates),
    map(version => this.versionTemplates.find(template => template.typeTemplate === (version))?.templateRef)
  );

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.version$.next(this.version$.getValue());
  }
}
