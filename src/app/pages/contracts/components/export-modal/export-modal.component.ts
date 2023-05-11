import { Component, OnInit } from '@angular/core';
import * as Excel from 'exceljs';

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.scss'],
})
export class ExportModalComponent implements OnInit {
  public startDate: Date;
  public endDate: Date;

  public exporting = false;

  constructor() { }

  ngOnInit() {}

  public async export(): Promise<void> {
    this.exporting = true;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet();

    // init columns
    worksheet.columns = [];
    worksheet.addRows
  }

}
