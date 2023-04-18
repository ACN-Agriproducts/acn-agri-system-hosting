import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { PrintableContractUtilitiesService } from '../printable-contract-utilities.service';

@Component({
  selector: 'contract-purchase-fixed-price',
  templateUrl: './purchase-fixed-price.component.html',
  styleUrls: [
    './purchase-fixed-price.component.scss',
    '../contract-styles.scss'
  ],
})
export class PurchaseFixedPriceComponent implements OnInit {
  @Input() contractForm: Contract;
  @Input() focusedField: string;
  readonly contractType: string = 'compra_precioFijo';

  constructor(public utils: PrintableContractUtilitiesService) { }

  ngOnInit() {}

}
