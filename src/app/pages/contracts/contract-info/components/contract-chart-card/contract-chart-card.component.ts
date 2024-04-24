import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-contract-chart-card',
  templateUrl: './contract-chart-card.component.html',
  styleUrls: ['./contract-chart-card.component.scss'],
})
export class ContractChartCardComponent implements OnInit {
  @Input() data: any;

  public chartDataMulti: {
    name: string,
    series: {
      name: string,
      value: number
    }[]
  }[];

  public stackedCustomColors: any;
  public labels: { [key: string]: string } = {};


  constructor(
    private transloco: TranslocoService
  ) {}

  ngOnInit() {
    this.transloco.selectTranslateObject('contracts.info.chart').subscribe(val => {
      this.labels = val;
      this.stackedCustomColors = [
        { name: val['Paid'], value: "#437b40" },
        { name: val['Pending'], value: "#FFBC04" },
        { name: val['Current Delivered'], value: "#437b40" },
        { name: val['To Be Delivered'], value: "#FFBC04" }
      ];
      this.buildChartData(this.data);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.buildChartData(this.data);
  }

  buildChartData(data: any) {
    this.chartDataMulti = [
      {
        name: this.labels["Grain"],
        series: [
          { name: this.labels["Current Delivered"], value: data.currentDelivered },
          { name: this.labels["To Be Delivered"], value: data.toBeDelivered }
        ]
      },
      {
        name: this.labels["Liquidations"],
        series: [
          { name: this.labels["Paid"], value: data.totalPaidLiquidations },
          { name: this.labels["Pending"], value: data.totalPendingLiquidations }
        ]
      },
      {
        name: this.labels["Payments"],
        series: [
          { name: this.labels["Paid"], value: data.totalPaidPayments },
          { name: this.labels["Pending"], value: data.totalPendingPayments }
        ]
      }
    ];
  }

}
