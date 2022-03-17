import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { OptionBusinessComponent } from '../option-business/option-business.component';
import { Storage } from '@ionic/storage';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-header-toolbar',
  templateUrl: './header-toolbar.component.html',
  styleUrls: ['./header-toolbar.component.scss']
})
export class HeaderToolbarComponent implements OnInit {
  @Input() public titulo: string;
  @Input() public border = true;
  currentCompany: String;

  constructor(
    private popoverController: PopoverController,
    private storage: Storage
  ) { 
    this.storage.get('currentCompany').then(val => this.currentCompany = val);
  }

  ngOnInit(): void {}

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
