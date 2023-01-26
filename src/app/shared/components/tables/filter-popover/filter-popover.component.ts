import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-filter-popover',
  templateUrl: './filter-popover.component.html',
  styleUrls: ['./filter-popover.component.scss'],
})
export class FilterPopoverComponent implements OnInit {

  constructor(
    private popoverCtrl: PopoverController,
  ) { }

  ngOnInit() {

  }

  public filter(fieldSearch: any): void {
    this.popoverCtrl.dismiss(fieldSearch, 'filter');
  }

  public clearFilter(): void {
    this.popoverCtrl.dismiss(null, 'clear');
  }
}
