import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { PrintableContractUtilitiesService } from '../printable-contract-utilities.service';

@Component({
  selector: 'contract-sales-fixed-price',
  templateUrl: './sales-fixed-price.component.html',
  styleUrls: [
    './sales-fixed-price.component.scss',
    '../contract-styles.scss'
  ],
})
export class SalesFixedPriceComponent implements OnInit {
  @Input() contractForm: Contract;
  @Input() focusedField: string;
  readonly contractType: string = 'deVenta_precioFijo';

  constructor(public utils: PrintableContractUtilitiesService) { }

  ngOnInit() {}

}
