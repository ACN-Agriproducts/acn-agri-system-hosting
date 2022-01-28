import { Component, OnInit, Input } from '@angular/core';
import { Weight } from '@shared/Weight/weight';

@Component({
  selector: 'app-display-contract',
  templateUrl: './display-contract.component.html',
  styleUrls: ['./display-contract.component.scss'],
})
export class DisplayContractComponent implements OnInit {

  @Input() contractForm: any;
  @Input() productsList: any[];
  @Input() weight: Weight;
  public today: Date = new Date();

  constructor() { }

  ngOnInit() {}

}
