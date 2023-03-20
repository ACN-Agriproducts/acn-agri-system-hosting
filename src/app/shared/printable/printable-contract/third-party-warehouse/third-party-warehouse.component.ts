import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'contract-third-party-warehouse',
  templateUrl: './third-party-warehouse.component.html',
  styleUrls: [
    './third-party-warehouse.component.scss',
    '../printable-contract-styles.scss'
  ],
})
export class ThirdPartyWarehouseComponent implements OnInit {
  @Input() contractForm: Contract;

  constructor() { }

  ngOnInit() {}

  ngOnChanges() {
    console.log(this.contractForm)
  }

}
