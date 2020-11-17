import { FiltersComponent } from './components/filters/filters.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tickest',
  templateUrl: './tickest.page.html',
  styleUrls: ['./tickest.page.scss'],
})
export class TickestPage implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    public popoverController: PopoverController,
    public dialog: MatDialog,
    private navController: NavController 
  ) { }

  ngOnInit() {
  }
  public openFilter = () => {
    const dialogRef = this.dialog.open(FiltersComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
// ModalTicketComponent