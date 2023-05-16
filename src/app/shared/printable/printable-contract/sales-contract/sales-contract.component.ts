import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { PrintableContractUtilitiesService } from '../printable-contract-utilities.service';

@Component({
  selector: 'sales-contract',
  templateUrl: './sales-contract.component.html',
  styleUrls: [
    './sales-contract.component.scss',
    '../contract-styles.scss',
    '../contract-english-styles.scss'
  ],
})
export class SalesContractComponent implements OnInit {
  @Input() contractForm: Contract;
  @Input() focusedField: string;
  readonly contractType: string = 'sales';

  constructor(public utils: PrintableContractUtilitiesService) { }

  ngOnInit() { }

}
