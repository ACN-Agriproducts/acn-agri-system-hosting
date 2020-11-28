import { FiltersComponent } from './components/filters/filters.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tickest',
  templateUrl: './tickest.page.html',
  styleUrls: ['./tickest.page.scss'],
})
export class TickestPage implements OnInit {

  constructor(
    public popoverController: PopoverController,
    public dialog: MatDialog,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
  }
  public openFilter = async () => {
    // const dialogRef = this.dialog.open(FiltersComponent);
    // dialogRef.afterClosed().subscribe(result => {
    //   console.log(`Dialog result: ${result}`);
    // });
    const modal = await this.modalController.create({
      component: FiltersComponent,
      cssClass: 'modal-filter-ticket',
    });
    return await modal.present();
    // this.bottomSheet.open(FiltersComponent);

  }
}
