import { Component, Input, OnInit, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { TypeTemplateDirective } from '@core/directive/type-template/type-template.directive';
import { Contract } from '@shared/classes/contract';
import { LiquidationTotals } from '@shared/classes/liquidation';
import { units } from '@shared/classes/mass';
import { ReportTicket } from '@shared/classes/ticket';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';

@Component({
  selector: 'app-printable-liquidation',
  templateUrl: './printable-liquidation.component.html',
  styleUrls: ['./printable-liquidation.component.scss'],
})
export class PrintableLiquidationComponent implements OnInit {
  @ViewChildren(TypeTemplateDirective) private versionTemplates: QueryList<TypeTemplateDirective>;

  @Input("format") set format(newVersion: string) {
    this.format$.next(newVersion);
  }
  @Input() selectedTickets: ReportTicket[];
  @Input() contract: Contract;
  @Input() totals: LiquidationTotals;
  @Input() colUnits: Map<string, units>;

  public format$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public template$: Observable<TemplateRef<any>> = this.format$.pipe(
    filter(() => !!this.versionTemplates),
    map(format => this.versionTemplates.find(template => template.typeTemplate === (format))?.templateRef)
  );

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.format$.next(this.format$.getValue());
  }
}
