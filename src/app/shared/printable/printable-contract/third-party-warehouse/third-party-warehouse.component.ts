import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { PrintableContractUtilitiesService } from '../printable-contract-utilities.service';

@Component({
  selector: 'contract-third-party-warehouse',
  templateUrl: './third-party-warehouse.component.html',
  styleUrls: [
    './third-party-warehouse.component.scss',
    '../contract-styles.scss'
  ],
})
export class ThirdPartyWarehouseComponent implements OnInit {
  @Input() contractForm: Contract;
  @Input() focusedField: string;
  readonly contractType: string = 'compra_bodegaTerceros';

  constructor(public utils: PrintableContractUtilitiesService) { }

  ngOnInit() {}

}
