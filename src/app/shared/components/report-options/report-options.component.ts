import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-report-options',
  templateUrl: './report-options.component.html',
  styleUrls: ['./report-options.component.scss'],
})
export class ReportOptionsComponent implements OnInit {
  public reportType: string;
  public reportQueryType: string;
  public startDate: Date;
  public endDate: Date;

  constructor() { }

  ngOnInit() {}

}
