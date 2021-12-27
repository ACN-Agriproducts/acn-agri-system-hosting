import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-contract-printable',
  templateUrl: './contract-printable.component.html',
  styleUrls: ['./contract-printable.component.scss'],
})
export class ContractPrintableComponent implements OnInit {

  @Input() contractForm: any;
  @Input() productsList: any[];
  public today: Date = new Date();

  constructor() { }

  ngOnInit() {}

}
