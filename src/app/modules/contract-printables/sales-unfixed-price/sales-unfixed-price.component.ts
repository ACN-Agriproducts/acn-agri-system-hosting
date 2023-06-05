import { Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { Contract } from '@shared/classes/contract';
import { PrintableContractUtilitiesService } from '../printable-contract-utilities.service';
import { FocusedFieldDirective } from '../printable-contract.component';
import { ContractSettings } from '@shared/classes/contract-settings';


@Component({
  selector: 'contract-sales-unfixed-price',
  templateUrl: './sales-unfixed-price.component.html',
  styleUrls: [
    './sales-unfixed-price.component.scss',
    '../contract-styles.scss'
  ],
})
export class SalesUnfixedPriceComponent implements OnInit, OnChanges {
  @Input() contractForm: Contract;
  @Input() focusedField: string;
  @Input() settings: ContractSettings;
  @ViewChildren(FocusedFieldDirective) fieldsList: QueryList<FocusedFieldDirective>;
  private focusedFields: FocusedFieldDirective[] = [];

  readonly contractType: string = 'deVenta_precioSinFijar';

  constructor(public utils: PrintableContractUtilitiesService) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if(this.focusedField == null) {
      this.focusedFields.forEach(f => f.isFocused = false);
      this.focusedFields = [];
    }

    if(changes['focusedField'] && this.focusedField) {
      const fields = this.fieldsList?.filter(ff => ff.fieldName == this.focusedField);

      if(fields?.length) {
        this.focusedFields.forEach(f => f.isFocused = false);
        fields[0].el.nativeElement.scrollIntoView({behavior: 'smooth', block: 'center'});
        fields.forEach(f => f.isFocused = true);
        this.focusedFields = fields;
      }
    }
  }

}
