import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { OptionsComponent } from './../options/options.component';

@Component({
  selector: 'app-table-treasury',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  public number: boolean;
  public customer: boolean;
  public issue: boolean;
  public paid: boolean;
  public billed: boolean;
  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit(): void {
  }

  public openOptions = async (event) => {
    const popover = await this.popoverController.create({
      component: OptionsComponent,
      event
    });
    return await popover.present();
  }
  public select = (event) => {}

}
