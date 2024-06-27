import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MonthlyTicketsComponent } from './components/monthly-tickets/monthly-tickets.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    
  }

  openDialog(): void {
    this.dialog.open(MonthlyTicketsComponent);
  }

}
