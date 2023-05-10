import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.scss'],
})
export class ExportModalComponent implements OnInit {
  public startDate: Date;
  public endDate: Date;

  constructor() { }

  ngOnInit() {}

  public export() {

  }

}
