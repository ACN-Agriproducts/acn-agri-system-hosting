import { Component, OnInit } from '@angular/core';
import { Firestore, doc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { DiscountTable, DiscountTables } from '@shared/classes/discount-tables';
import { Product } from '@shared/classes/product';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  public product: string;
  public ready: boolean = false;
  public doc: Product;
  public discountTables: DiscountTables;

  constructor(
    private route: ActivatedRoute,
    private db: Firestore,
    private session: SessionInfo,
    private dialog: MatDialog,
  ) { 
    this.product = route.snapshot.paramMap.get('product');
  }

  ngOnInit() {
    Product.getProduct(this.db, this.session.getCompany(), this.product).then(productDoc => {
      this.doc = productDoc;
      this.ready = true;
    });

    DiscountTables.getDiscountTables(this.db, this.session.getCompany(), this.product).then(async result => {
      if (!result) {
        const newTables = new DiscountTables(doc(DiscountTables.getCollectionReference(this.db, this.session.getCompany(), this.product)));
        await newTables.set();
        
        this.discountTables = newTables;
        return;
      }

      this.discountTables = result;
    });
  }

  async addTable() {
    const dialogRef = this.dialog.open(NewDiscountTableDialog, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (!result) return;

      this.discountTables.tables.push(result);
      await this.discountTables.set();
    });
  }
}

@Component({
  selector: 'new-discount-table-dialog',
  templateUrl: './new-discount-table-dialog.html',
  styleUrls: ['./product.page.scss']
})
export class NewDiscountTableDialog implements OnInit {
  public table: DiscountTable;
  public standardConfig: boolean = true;

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  
  constructor() {}

  ngOnInit() {
    this.table = new DiscountTable();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.table.headers, event.previousIndex, event.currentIndex);
  }

  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    if (value) {
      this.table.headers.push(value);
    }
    event.chipInput!.clear();
  }

  remove(header: string) {
    const index = this.table.headers.indexOf(header);

    if (index >= 0) {
      this.table.headers.splice(index, 1);
    }
  }
}
