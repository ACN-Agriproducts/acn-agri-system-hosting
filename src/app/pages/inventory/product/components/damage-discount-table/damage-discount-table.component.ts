import { Component, Input, OnInit } from '@angular/core';
import { Product } from '@shared/classes/product';
import { MatTable } from '@angular/material/table';

export interface ScoreElement {
  score: string;
}

const DAMAGE_DISCOUNT_MOCK_DATA = [
  { row: '1' },
  { row: '2' },
  { row: '3' }
];

@Component({
  selector: 'app-damage-discount-table',
  templateUrl: './damage-discount-table.component.html',
  styleUrls: ['./damage-discount-table.component.scss'],
})
export class DamageDiscountTableComponent implements OnInit {
  @Input() product: Product;

  displayedColumns: string[] = ['row'];
  dataSource = DAMAGE_DISCOUNT_MOCK_DATA;

  constructor() { }

  ngOnInit() {
    console.log(this.product)
  }

}
