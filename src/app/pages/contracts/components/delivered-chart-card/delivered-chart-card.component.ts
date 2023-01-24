import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
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

  private ticketList: Ticket[];
  
  constructor(
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.contract.getTickets().then(result => {
      this.ticketList = result;
      this.buildTableData();
    });
  }

  buildTableData() {
    const lineDataReal: ChartData = {
      name: "Delivered",
      series: []
    };
    const LineDataTrend: ChartData = {
      name: "Trend",
      series: []
    }

    const ticketData: ChartData = {
      name: "Delivered", 
      series: []
    }
    const ticketList = this.ticketList.sort((a,b) => a.dateOut.getTime() - b.dateOut.getTime());

    // Get data for day changes
    ticketList.forEach(ticket => {
      const name = this.datePipe.transform(ticket.dateOut, 'MMM d');

      let series = ticketData.series.find(s => s.name == name);
      if(!series) {
        series = {name, value: 0};
        ticketData.series.push(series);
      }
      series.value += ticket.getNet().getMassInUnit('mTon');
    });

    // Get start and end dates at midnight
    const trendLineStartDate = this.contract.delivery_dates.begin;
    const trendLineEndDate = this.contract.delivery_dates.end;
    const ticketLineStart = ticketList[0]?.dateOut ?? new Date();
    const ticketLineEnd = ticketList[ticketList.length - 1].dateOut ?? new Date();
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
    for(let date = new Date(absoluteStartDate), index = 1; date.getTime() <= absoluteEndDate.getTime(); date.setDate(date.getDate() + 1), index++) {
      const name = this.datePipe.transform(date, 'MMM d');

      LineDataTrend.series.push({
        name,
        value: 0
      });

      const ticketDayChange = ticketData.series.find(t => t.name == name);
      lineDataReal.series.push({
        name,
        value: (ticketDayChange?.value ?? 0) + (lineDataReal.series[lineDataReal.series.length - 1]?.value ?? 0)
      });
    }

    // Create data for trend line
    for(let date = new Date(trendLineStartDate), index = 1; date.getTime() <= absoluteEndDate.getTime(); date.setDate(date.getDate() + 1), index++) {
      const day = LineDataTrend.series.find(d => d.name == this.datePipe.transform(date, 'MMM d'));
      if(!day) {
        console.log(absoluteStartDate, absoluteEndDate, date);
        console.table(LineDataTrend.series)
      };
      const trendValue = steps * index;
      day.value = Math.min(trendValue, this.contract.quantity.getMassInUnit('mTon'));
    }
    
    // Assign data to chart
    this.chartData = [LineDataTrend, lineDataReal];
  }
}

interface ChartData {
  name: string;
  series: {
    name: string;
    value: number;
  }[]
}