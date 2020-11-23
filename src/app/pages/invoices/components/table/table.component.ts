import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { OptionsComponent } from '../options/options.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  public selectText: boolean;
  public number: boolean;
  public customer: boolean;
  public issue: boolean;
  public paid: boolean;
  public billed: boolean;
  constructor(
    private popoverController: PopoverController,
    private snackBar: MatSnackBar

    // private clipboard: Clipboard
  ) { }

  ngOnInit(): void {
  }
  public openOptions = async (ev) => {
    ev.preventDefault();
    const options = await this.popoverController.create({
      component: OptionsComponent,
      event: ev,
      componentProps: {selectText: ev.target.innerText}
    });
    await options.present();
    options.onDidDismiss().then(result => {
      if(result.data){
        this.snackBar.open('Was copied.', 'Ok', {
          duration: 1200,
        });
      }
    });
  }
  public select = (event) => {
    console.log(event);
    this.selectText = this.selectText = true;
  }
}
