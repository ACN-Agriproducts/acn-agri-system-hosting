import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BachocoDialogComponent } from 'src/app/standalone/reports/bachoco/bachoco-dialog/bachoco-dialog.component';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
  public bachoco = BachocoDialogComponent;

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openDialog(component: any) {
    return () => {this.dialog.open(component)};
  }

}
