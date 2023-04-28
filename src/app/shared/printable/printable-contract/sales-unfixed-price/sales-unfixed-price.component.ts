import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { PrintableContractUtilitiesService } from '../printable-contract-utilities.service';


@Component({
  selector: 'contract-sales-unfixed-price',
  templateUrl: './sales-unfixed-price.component.html',
  styleUrls: [
    './sales-unfixed-price.component.scss',
    '../contract-styles.scss'
  ],
})
export class SalesUnfixedPriceComponent implements OnInit {
  @Input() contractForm: Contract;
  @Input() focusedField: string;
  readonly contractType: string = 'deVenta_precioSinFijar';

  constructor(public utils: PrintableContractUtilitiesService) { }

  ngOnInit() {}

}
