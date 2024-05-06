import { PopoverController } from '@ionic/angular';
import { ShowContactModalComponent } from './../show-contact-modal/show-contact-modal.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-options-directory',
  templateUrl: './options-directory.component.html',
  styleUrls: ['./options-directory.component.scss']
})
export class OptionsDirectoryComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private popoverController: PopoverController
  ) { }

  ngOnInit(): void {
  }
  

  public openContactModal = () => {
    this.popoverController.dismiss();
    const dialogRef = this.dialog.open(ShowContactModalComponent, {
      autoFocus: false,
      minWidth: '700px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

}
