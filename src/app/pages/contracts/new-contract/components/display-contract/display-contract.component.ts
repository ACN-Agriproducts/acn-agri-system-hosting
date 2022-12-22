import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Mass } from '@shared/classes/mass';
import { Weight } from '@shared/Weight/weight';

@Component({
  selector: 'app-display-contract',
  templateUrl: './display-contract.component.html',
  styleUrls: ['./display-contract.component.scss'],
})
export class DisplayContractComponent implements OnInit, OnChanges {

  @Input() contractForm: any;
  @Input() productsList: any[];
  @Input() weight: Mass;

  constructor() { }

  ngOnInit() {
    this.contractForm.date = new Date();
    this.contractForm.quantity = this.weight;
  }

  ngOnChanges() {
    console.log(this.weight)
    this.contractForm.quantity = this.weight;
  }

}
