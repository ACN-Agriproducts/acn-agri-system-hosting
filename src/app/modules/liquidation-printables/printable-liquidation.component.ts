import { Component, Input, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { TypeTemplateDirective } from '@core/directive/type-template/type-template.directive';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';
import { Contract } from '@shared/classes/contract';
import { TicketInfo, LiquidationTotals } from '@shared/classes/liquidation';
import { units } from '@shared/classes/mass';

import * as Excel from 'exceljs';

@Component({
  selector: 'app-printable-liquidation',
  templateUrl: './printable-liquidation.component.html',
  styleUrls: ['./printable-liquidation.component.scss'],
})
export class PrintableLiquidationComponent implements OnInit {
  @ViewChildren(TypeTemplateDirective) private versionTemplates: QueryList<TypeTemplateDirective>;

  @Input("format") set format(newFormat: string) {
    this.format$.next(newFormat);
  }
  @Input() data: LiquidationPrintableData;

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

  public createExcelLiquidation(worksheet: Excel.Worksheet): void {
    this.format$.subscribe(format => {
      
    })
  }
}

export interface LiquidationPrintableData {
  selectedTickets: TicketInfo[];
  contract: Contract;
  totals: LiquidationTotals;
  displayUnits?: Map<string, units>;
  canceled?: boolean;
}
