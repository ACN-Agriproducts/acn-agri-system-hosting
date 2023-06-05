import { Component, OnInit } from '@angular/core';
import { Firestore, doc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { SessionInfo } from '@core/services/session-info/session-info.service';
import { DiscountTables } from '@shared/classes/discount-tables';
import { Product } from '@shared/classes/product';
import { MatDialog } from '@angular/material/dialog';

import { SetDiscountTableDialogComponent } from './components/set-discount-table-dialog/set-discount-table-dialog.component';
import { ConfirmationDialogService } from '@core/services/confirmation-dialog/confirmation-dialog.service';

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
    private confirmation: ConfirmationDialogService,
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
    const dialogRef = this.dialog.open(SetDiscountTableDialogComponent, {
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (!result) return;

      this.discountTables.tables.push(result);
      await this.discountTables.set();
    });
  }

  async deleteTable(tableIndex: number) {
    const confirm = this.confirmation.openDialog(`delete the "${this.discountTables.tables[tableIndex].name}" table`);

    if ((await confirm) == true) {
      this.discountTables.tables.splice(tableIndex, 1);
      this.discountTables.set();
    }
  }

  ngOnDestroy() {
    delete this.discountTables;
  }
}
