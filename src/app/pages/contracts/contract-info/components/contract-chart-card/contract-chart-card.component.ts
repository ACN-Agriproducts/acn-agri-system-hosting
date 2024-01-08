import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-contract-chart-card',
  templateUrl: './contract-chart-card.component.html',
  styleUrls: ['./contract-chart-card.component.scss'],
})
export class ContractChartCardComponent implements OnInit {
  @Input() data: any;

  public colorScheme: any = {
    domain: [
      "#FFBC04", 
      "#61ad5e", 
      "#437b40"
    ]
  };
  public stackedCustomColors: any = [
    { name: "Paid", value: "#437b40" },
    { name: "Pending", value: "#FFBC04" },
    { name: "To Be Delivered", value: "#437b40" }
  ];
  public chartDataMulti: {
    name: string,
    series: {
      name: string,
      value: number
    }[]
  }[];


  constructor(
    private transloco: TranslocoService
  ) {}

  ngOnInit() {
    this.buildChartData(this.data);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.buildChartData(this.data);
  }

  buildChartData(data: any) {
    this.chartDataMulti = [
      {
        name: this.transloco.translate("contracts.info.Grain"),
        series: [
          { name: "To Be Delivered", value: data.toBeDelivered },
        ]
      },
      {
        name: this.transloco.translate("contracts.info.Liquidations"),
        series: [
          { name: "Paid", value: data.totalPaidLiquidations },
          { name: "Pending", value: data.totalPendingLiquidations }
        ]
      },
      {
        name: this.transloco.translate("contracts.info.Payments"),
        series: [
          { name: "Paid", value: data.totalPaidPayments },
          { name: "Pending", value: data.totalPendingPayments }
        ]
      }
    ];
  }

}
