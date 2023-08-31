import { Component, Input, OnInit, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { TypeTemplateDirective } from '@core/directive/type-template/type-template.directive';
import { Contract } from '@shared/classes/contract';
import { ReportTicket, LiquidationTotals } from '@shared/classes/liquidation';
import { units } from '@shared/classes/mass';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';
import { LiquidationDialogData } from './liquidation-dialog/liquidation-dialog.component';

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
  @Input() data: LiquidationDialogData;

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
