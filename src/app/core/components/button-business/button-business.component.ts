import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { OptionBusinessComponent } from '../option-business/option-business.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'button-business',
  templateUrl: './button-business.component.html',
  styleUrls: ['./button-business.component.scss']
})
export class ButtonBusinessComponent implements OnInit {

  constructor(
    private popoverController: PopoverController,
  ) { }
  ngOnInit(): void {
  }
  public presentPopover = async (ev: any) => {
    const popover = await this.popoverController.create({
      component: OptionBusinessComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    return await popover.present();
  }
}
