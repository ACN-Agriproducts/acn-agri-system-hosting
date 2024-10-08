import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { TranslocoService } from '@ngneat/transloco';
import { Contract } from '@shared/classes/contract';
import { Mass } from '@shared/classes/mass';
import { Ticket } from '@shared/classes/ticket';
import { FilterContractsPipe } from '@shared/pipes/filter-contracts.pipe';

@Component({
  selector: 'app-delivered-chart-card',
  templateUrl: './delivered-chart-card.component.html',
  styleUrls: ['./delivered-chart-card.component.scss'],
})
export class DeliveredChartCardComponent implements OnInit {
  @Input() contract: Contract;
  public chartData: ChartData[];
  public refLines: any[];
  public notification: "complete" | "behind" | "late";
  public colorScheme: any = {
    domain: ["#FFBC04", "#4D8C4A"]
  };
  public labels: { [key: string]: string } = {};
  
  constructor(
    private datePipe: DatePipe,
    private session: SessionInfo,
    private transloco: TranslocoService
  ) { }

  ngOnInit() {
    this.transloco.selectTranslateObject('contracts.table.chart').subscribe(val => {
      this.labels = val;
      this.buildTableData();
    });
  }

  buildTableData() {
    this.refLines = [{
      name: this.labels["Delivered"],
      value: this.contract.currentDelivered.getMassInUnit('mTon')
    },
    {
      name: this.labels["Total"],
      value: this.contract.quantity.getMassInUnit('mTon')
    }];

    const lineDataReal: ChartData = {
      name: this.labels["Delivered"],
      series: []
    };
    const LineDataTrend: ChartData = {
      name: this.labels["Trend"],
      series: []
    }

    const ticketData: ChartData = {
      name: this.labels["Delivered"], 
      series: []
    }

    // Get and sort delivery history
    ticketData.series = Object.entries(this.contract.deliveredHistory).map(e => {return {name: e[0], value: new Mass(e[1], this.session.getDefaultUnit()).getMassInUnit('mTon')}});
    ticketData.series.sort((a, b) => this.parseDateString(a.name).getTime() - this.parseDateString(b.name).getTime())
    console.log(this.contract.deliveredHistory, ticketData.series);


    // Get start and end dates at midnight
    const trendLineStartDate = this.contract.delivery_dates.begin;
    const trendLineEndDate = this.contract.delivery_dates.end;
    const ticketLineStart = ticketData?.[0] ? this.parseDateString(ticketData[0]) : new Date();
    const ticketLineEnd = new Date();
    trendLineStartDate.setHours(0, 0, 0, 0);
    trendLineEndDate.setHours(0, 0, 0, 0);
    ticketLineStart.setHours(0, 0, 0, 0);
    ticketLineEnd.setHours(0, 0, 0, 0);

    const absoluteStartDate = trendLineStartDate.getTime() < ticketLineStart.getTime() ? trendLineStartDate : ticketLineStart;
    const absoluteEndDate = trendLineEndDate.getTime() < ticketLineEnd.getTime() ? ticketLineEnd : trendLineEndDate;

    // Calculate quantity for each day
    const daysBetween = (trendLineEndDate.getTime() - trendLineStartDate.getTime()) / (1000 * 3600 * 24);
    const steps = this.contract.quantity.getMassInUnit('mTon') / daysBetween;

    // Create points for both lines
    for(let date = new Date(absoluteStartDate.getFullYear(), absoluteStartDate.getMonth(), absoluteStartDate.getDate() - 1), index = 1; date.getTime() <= absoluteEndDate.getTime(); date.setDate(date.getDate() + 1), index++) {
      const name = this.datePipe.transform(date, 'YY MMM d');

      LineDataTrend.series.push({
        name,
        value: 0
      });

      if(date.getTime() <= ticketLineEnd.getTime()) {
        const ticketDayChange = ticketData.series.find(t => t.name == name);
        lineDataReal.series.push({
          name,
          value: (ticketDayChange?.value ?? 0) + (lineDataReal.series[lineDataReal.series.length - 1]?.value ?? 0)
        });
      }
    }

    // Create data for trend line
    for(let date = new Date(trendLineStartDate), index = 1; date.getTime() <= absoluteEndDate.getTime(); date.setDate(date.getDate() + 1), index++) {
      const day = LineDataTrend.series.find(d => d.name == this.datePipe.transform(date, 'YY MMM d'));
      if(!day) {
        console.log(absoluteStartDate, absoluteEndDate, date);
        console.table(LineDataTrend.series)
      };
      const trendValue = steps * index;
      day.value = Math.min(trendValue, this.contract.quantity.getMassInUnit('mTon'));
    }
    
    // Check if card needs notification color.
    const nameTicketLast = this.datePipe.transform(ticketLineEnd, "YY MMM d");
    const ticketSeries = lineDataReal.series.find(series => series.name == nameTicketLast);
    const trendSeries = LineDataTrend.series.find(series => series.name == nameTicketLast);

    if(ticketSeries.value >= trendSeries.value) {
      this.notification = "complete";
    }
    else if(ticketLineEnd.getTime() > this.contract.delivery_dates.end.getTime()) {
      this.notification = "late";
    }
    else if(ticketSeries.value <= trendSeries.value * .85) {
      this.notification = "behind";
    }

    // Assign data to chart
    this.chartData = [LineDataTrend, lineDataReal];
  }

  parseDateString(date: string): Date {
    return new Date(Math.floor(this.contract.date.getFullYear() / 100) + date);
  }
}

interface ChartData {
  name: string;
  series: {
    name: string;
    value: number;
  }[]
}