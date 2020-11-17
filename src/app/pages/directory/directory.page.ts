import { PopoverController } from '@ionic/angular';
import { ShowContactModalComponent } from './components/show-contact-modal/show-contact-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { OptionsDirectoryComponent } from './components/options-directory/options-directory.component';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.page.html',
  styleUrls: ['./directory.page.scss'],
})
export class DirectoryPage implements OnInit {

  constructor(
    private dialog: MatDialog,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
  }
  public openContactModal = () => {
    const dialogRef = this.dialog.open(ShowContactModalComponent, {
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(response => {

    });
  }
  public openOptions = async (event: any) => {
    event.preventDefault();
    const popover = await this.popoverController.create({
      component: OptionsDirectoryComponent,
      cssClass: 'my-custom-class',
      event,
      translucent: true
    });
    return await popover.present();
  }

}
