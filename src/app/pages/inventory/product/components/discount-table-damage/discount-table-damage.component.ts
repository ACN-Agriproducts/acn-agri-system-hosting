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
  selector: 'app-discount-table-damage',
  templateUrl: './discount-table-damage.component.html',
  styleUrls: ['./discount-table-damage.component.scss'],
})
export class DiscountTableDamageComponent implements OnInit {
  @Input() product: Product;

  displayedColumns: string[] = ['row'];
  dataSource = DAMAGE_DISCOUNT_MOCK_DATA;

  constructor() { }

  ngOnInit() {
    console.log(this.product)
  }

}
