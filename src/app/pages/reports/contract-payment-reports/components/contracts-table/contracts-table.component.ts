import { Component, Input, OnInit } from '@angular/core';
import { Contract } from '@shared/classes/contract';

@Component({
  selector: 'app-contracts-table',
  templateUrl: './contracts-table.component.html',
  styleUrls: ['./contracts-table.component.scss'],
})
export class ContractsTableComponent implements OnInit {
  @Input() contracts: Contract[];

  constructor() { }

  ngOnInit() {}

}
