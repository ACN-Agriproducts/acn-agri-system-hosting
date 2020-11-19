import { ShowModalComponent } from './components/show-modal/show-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
})
export class EmployeesPage implements OnInit {

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  public openModal = () => {
    const dialogRef = this.dialog.open(ShowModalComponent, {
      autoFocus: false,
      minWidth: '700px',
    });
    dialogRef.afterClosed().subscribe(result => {
      
    });
  }
}
