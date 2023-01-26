import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { Analytics } from '@shared/classes/analytics';
import { BarChartType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-grain-comparizon',
  templateUrl: './grain-comparizon.component.html',
  styleUrls: ['./grain-comparizon.component.scss'],
})

export class GrainComparizonComponent implements OnInit {
  private analytics: Analytics[];
  public chartData: ChartData[];

  constructor(
    private db: Firestore,
    private session: SessionInfo,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    Analytics.getAnalyticsForLastNYears(this.db, this.session.getCompany(), 3).then(result => {
      this.analytics = result;
      this.generateChart();
    });
  }

  generateChart() {
    const date = new Date();
    const chartData = [];
    const product = "Yellow Corn";

    for(let month = 0; month < 12; month++) {
      date.setMonth(month);
      const currentData: ChartData = {
        name: this.datePipe.transform(date, "MMM"),
        series: []
      }

      this.analytics.forEach(analytic => {
        currentData.series.push({
          name: analytic.year.toString(),
          value: analytic.companyGrainChange[product][month].in.getMassInUnit('mTon')
        });
      });

      chartData.push(currentData);
    }

    this.chartData = chartData;
  }
}

interface ChartData {
  name: string;
  series: ChartSeries[];
}

interface ChartSeries {
  name: string;
  value: number;
}
