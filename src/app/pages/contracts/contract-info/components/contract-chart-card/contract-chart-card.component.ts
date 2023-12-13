import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-contract-chart-card',
  templateUrl: './contract-chart-card.component.html',
  styleUrls: ['./contract-chart-card.component.scss'],
})
export class ContractChartCardComponent implements OnInit {
  @Input() contractChartData: any;

  public colorScheme: any = {
    domain: ["#FFBC04", "#61ad5e", "#437b40"]
  };
  public chartData: {
    name: string,
    value: number
  }[];


  constructor(
    private transloco: TranslocoService
  ) {}

  ngOnInit() {
    this.buildChartData(this.contractChartData);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.buildChartData(this.contractChartData);
  }

  buildChartData(data: any) {
    this.chartData = [
      {
        name: this.transloco.translate("contracts.info.Liquidations"),
        value: data[0],
      },
      {
        name: this.transloco.translate("contracts.info.Payments"),
        value: data[1]
      },
      {
        name: this.transloco.translate("contracts.info.Grain"),
        value: data[2]
      }
    ];
  }

}
