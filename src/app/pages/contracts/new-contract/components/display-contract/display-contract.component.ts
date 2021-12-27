import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-display-contract',
  templateUrl: './display-contract.component.html',
  styleUrls: ['./display-contract.component.scss'],
})
export class DisplayContractComponent implements OnInit {

  @Input() contractForm: any;
  @Input() productsList: any[];

  constructor() { }

  ngOnInit() {}

}
