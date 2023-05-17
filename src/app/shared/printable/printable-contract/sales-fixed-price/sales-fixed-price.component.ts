import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { PrintableContractUtilitiesService } from '../printable-contract-utilities.service';
import { FocusedFieldDirective } from '../printable-contract.component';

@Component({
  selector: 'contract-sales-fixed-price',
  templateUrl: './sales-fixed-price.component.html',
  styleUrls: [
    './sales-fixed-price.component.scss',
    '../contract-styles.scss'
  ],
})
export class SalesFixedPriceComponent implements OnInit, OnChanges {
  @Input() contractForm: Contract;
  @Input() focusedField: string;
  @ViewChildren(FocusedFieldDirective) fieldsList: QueryList<FocusedFieldDirective>;
  readonly contractType: string = 'deVenta_precioFijo';

  constructor(public utils: PrintableContractUtilitiesService) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
      if(changes['focusedField'] && this.focusedField) {
        this.fieldsList?.find(ff => ff.fieldName == this.focusedField)?.el.nativeElement.scrollIntoView({behavior: 'smooth', block: 'center'});
      }
  }

}
