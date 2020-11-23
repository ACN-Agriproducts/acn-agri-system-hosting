import { PopoverController } from '@ionic/angular';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  @Input() public selectText: string;
  constructor(
    private clipboard: Clipboard,
    private popoverController: PopoverController,
    private storage: Storage
  ) { }

  ngOnInit(): void {
    console.log(this.selectText);
  }
  public copy = () => {
    this.clipboard.copy(this.selectText);
    this.addClipboard(this.selectText);
    this.popoverController.dismiss(true);
  }

  public addClipboard = (itemCilpboard: string) => {
    let clipboard = [];
    this.storage.get('clipboard').then(data => {
      if (data) {
        clipboard = data;
        clipboard.push(itemCilpboard);
        this.storage.set('clipboard', clipboard);
      } else {
        this.storage.set('clipboard', itemCilpboard);
      }
    });
  }

}
