import { OptionsComponent } from './components/options/options.component';
import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-treasury',
  templateUrl: './treasury.page.html',
  styleUrls: ['./treasury.page.scss'],
})
export class TreasuryPage implements OnInit {
  public press: any;
  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
  }

  public down = (event) => {
    console.log(event);
    this.press = setTimeout(() => {
      console.log('PRECIONO');
    }, 500);
  }
  public up = (event) => {
    console.log(event);

    clearTimeout(this.press)
  }
  public openOptions = async (event) => {
    const popover = await this.popoverController.create({
      component: OptionsComponent,
      event
    });
  }
}
